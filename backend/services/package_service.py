import logging
from typing import Optional

from sqlalchemy.orm import Session

from core.exceptions import (
    NotFoundException,
    ConflictException,
    ValidationException,
)
from core.state_machines import PACKAGE_TRANSITIONS, validate_transition
from models.package import Package
from models.package_item import PackageItem
from models.trip import Trip
from repositories.package_repository import PackageRepository
from schemas.package import (
    PackageCreate,
    PackageUpdate,
    PackageAssignTrip,
    PackageStatusUpdate,
    PackageSummary,
)

logger = logging.getLogger(__name__)


class PackageService:

    def __init__(
        self,
        db: Session,
        repo: PackageRepository | None = None,
    ):
        self.db = db
        self.repo = repo or PackageRepository(db)

    def get_all(
        self, skip: int = 0, limit: int = 100, status: Optional[str] = None
    ) -> list[Package]:
        return self.repo.get_all_with_filters(skip, limit, status)

    def get_by_id(self, package_id: int) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException(f"Encomienda con id {package_id} no encontrada")
        return pkg

    def get_unassigned(self, skip: int = 0, limit: int = 100) -> list[Package]:
        return self.repo.get_unassigned(skip, limit)

    def get_by_tracking(self, tracking_number: str) -> Package:
        pkg = self.repo.search_by_tracking(tracking_number)
        if not pkg:
            raise NotFoundException(
                f"Encomienda con número de seguimiento {tracking_number} no encontrada"
            )
        return pkg

    def get_by_sender(self, client_id: int) -> list[Package]:
        return self.repo.get_by_sender(client_id)

    def get_by_recipient(self, client_id: int) -> list[Package]:
        return self.repo.get_by_recipient(client_id)

    def get_by_trip(self, trip_id: int) -> list[Package]:
        return self.repo.get_by_trip(trip_id)

    def get_pending_collections(
        self, office_id: int, skip: int = 0, limit: int = 100
    ) -> list[Package]:
        return self.repo.get_pending_collections(office_id, skip, limit)

    def create_package(self, data: PackageCreate) -> Package:
        import uuid

        logger.debug("Creating package with data: %s", data)

        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate
        from core.enums import CashTransactionType, PaymentMethod

        cash_service = CashRegisterService(self.db)

        secretary = self.repo.get_secretary_by_id(data.secretary_id)

        origin_office_id = data.origin_office_id
        if not origin_office_id and secretary and secretary.office_id:
            origin_office_id = secretary.office_id

        current_register = None
        if getattr(data, "payment_status", None) == "paid_on_send":
            office_id = (
                origin_office_id or (secretary.office_id if secretary else None) or 1
            )
            if not office_id:
                raise ValidationException(
                    "El usuario no tiene una oficina asignada para abrir caja."
                )
            current_register = cash_service.get_current_register(office_id)
            if not current_register:
                raise ValidationException(
                    "No hay caja abierta para su oficina. Debe abrir caja antes de registrar envíos pagados al instante."
                )

        package_data = data.model_dump(exclude={"items", "tracking_number"})
        package_data["tracking_number"] = f"TEMP-{uuid.uuid4().hex[:8]}"
        package_data["origin_office_id"] = origin_office_id
        package_data["destination_office_id"] = data.destination_office_id
        actual_status = package_data.get("status", "registered_at_office")
        db_package = Package(**package_data)
        self.repo.create_package(db_package)

        db_package.tracking_number = f"ENC-{db_package.id:06d}"

        total_amount = 0.0
        for item_data in data.items:
            item_dict = item_data.model_dump()
            item_dict["total_price"] = item_dict["quantity"] * item_dict["unit_price"]
            item_dict["package_id"] = db_package.id
            total_amount += item_dict["total_price"]
            self.repo.create_item(PackageItem(**item_dict))

        if (
            data.payment_status == "paid_on_send"
            and current_register
            and total_amount > 0
        ):
            payment_enum = PaymentMethod.CASH
            if data.payment_method:
                try:
                    payment_enum = PaymentMethod(data.payment_method.lower())
                except ValueError:
                    pass
            cash_service.record_transaction(
                CashTransactionCreate(
                    cash_register_id=current_register.id,
                    type=CashTransactionType.PACKAGE_PAYMENT,
                    amount=total_amount,
                    payment_method=payment_enum,
                    reference_id=db_package.id,
                    reference_type="package",
                    description=f"Pago por envío de encomienda temporal {package_data['tracking_number']}",
                )
            )

        self.repo.log_state_change(
            package_id=db_package.id,
            old_state=None,
            new_state=actual_status,
        )

        self.db.commit()

        result = self.repo.get_by_id_eager(db_package.id)
        logger.debug("Package created: %d with %d items", result.id, len(result.items))
        return result

    def update_package(self, package_id: int, data: PackageUpdate) -> Package:
        pkg = self.repo.get_by_id_or_raise(package_id, "Package")
        for field, value in data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(pkg, field, value)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def delete_package(self, package_id: int) -> str:
        pkg = self.repo.get_by_id_or_raise(package_id, "Package")
        tracking = pkg.tracking_number
        self.repo.delete_package(pkg)
        self.db.commit()
        return tracking

    def assign_to_trip(self, package_id: int, data: PackageAssignTrip) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        if pkg.status != "registered_at_office":
            raise ValidationException(
                f"Solo se pueden asignar encomiendas en estado 'registered_at_office'. Estado actual: '{pkg.status}'"
            )

        trip = self.repo.get_trip_by_id(data.trip_id)
        if not trip:
            raise NotFoundException("Viaje no encontrado")

        old_status = pkg.status
        pkg.trip_id = data.trip_id
        pkg.status = "assigned_to_trip"

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="assigned_to_trip",
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def unassign_from_trip(self, package_id: int) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        if pkg.status != "assigned_to_trip":
            raise ValidationException(
                f"Solo se pueden desasignar encomiendas en estado 'assigned_to_trip'. Estado actual: '{pkg.status}'"
            )

        old_status = pkg.status
        pkg.trip_id = None
        pkg.status = "registered_at_office"

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="registered_at_office",
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def update_status(self, package_id: int, data: PackageStatusUpdate) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        validate_transition("package", PACKAGE_TRANSITIONS, pkg.status, data.new_status)

        old_status = pkg.status
        pkg.status = data.new_status

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state=data.new_status,
            changed_by_user_id=data.changed_by_user_id,
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def deliver_package(
        self,
        package_id: int,
        payment_method: str,
        changed_by_user_id: Optional[int] = None,
    ) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate
        from core.enums import CashTransactionType, PaymentMethod as EnumPaymentMethod

        cash_service = CashRegisterService(self.db)

        current_register = None
        delivering_secretary = None
        if pkg.payment_status == "collect_on_delivery":
            if not changed_by_user_id:
                raise ValidationException(
                    "Se requiere el usuario operador para entregas por cobrar."
                )
            delivering_secretary = self.repo.get_secretary_by_user_id(
                changed_by_user_id
            )
            office_id = (
                delivering_secretary.office_id
                if delivering_secretary and delivering_secretary.office_id
                else 1
            )
            if not office_id:
                raise ValidationException("El usuario no tiene una oficina asignada.")
            current_register = cash_service.get_current_register(office_id)
            if not current_register:
                raise ValidationException(
                    "No hay caja abierta para su oficina. No puede recibir cobros de encomiendas por entregar."
                )

        validate_transition("package", PACKAGE_TRANSITIONS, pkg.status, "delivered")

        old_status = pkg.status
        pkg.status = "delivered"

        if delivering_secretary:
            pkg.delivered_by_secretary_id = delivering_secretary.id
            if (
                pkg.destination_office_id
                and delivering_secretary.office_id != pkg.destination_office_id
            ):
                logger.warning(
                    "Secretaria %s (oficina %s) entregando encomienda %d en oficina destino %s distinta",
                    delivering_secretary.id,
                    delivering_secretary.office_id,
                    pkg.id,
                    pkg.destination_office_id,
                )

        if pkg.payment_status == "collect_on_delivery":
            pkg.payment_method = payment_method

            if current_register:
                payment_enum = EnumPaymentMethod.CASH
                try:
                    payment_enum = EnumPaymentMethod(payment_method.lower())
                except ValueError:
                    pass

                cash_service.record_transaction(
                    CashTransactionCreate(
                        cash_register_id=current_register.id,
                        type=CashTransactionType.POR_COBRAR_COLLECTION,
                        amount=sum(i.total_price for i in pkg.items),
                        payment_method=payment_enum,
                        reference_id=pkg.id,
                        reference_type="package",
                        description=f"Cobro en destino de encomienda {pkg.tracking_number}",
                    )
                )

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="delivered",
            changed_by_user_id=changed_by_user_id,
        )
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def cancel_package(self, package_id: int) -> Package:
        pkg = self.repo.get_by_id_eager(package_id)
        if not pkg:
            raise NotFoundException("Encomienda no encontrada")

        if pkg.status == "cancelled":
            return pkg

        old_status = pkg.status
        pkg.status = "cancelled"

        self.repo.log_state_change(
            package_id=pkg.id,
            old_state=old_status,
            new_state="cancelled",
        )

        self._create_reversal_if_applicable(pkg)

        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def _create_reversal_if_applicable(self, pkg: Package) -> None:
        from core.enums import CashTransactionType, PaymentMethod
        from models.cash_transaction import CashTransaction

        original_tx = self.repo.get_cash_transaction_by_reference(
            "package", pkg.id, CashTransactionType.PACKAGE_PAYMENT
        )

        if not original_tx:
            return

        secretary = self.repo.get_secretary_by_id(pkg.secretary_id)
        if not secretary or not secretary.office_id:
            return

        from services.cash_register_service import CashRegisterService
        from schemas.cash_register import CashTransactionCreate

        cash_service = CashRegisterService(self.db)
        open_register = cash_service.get_current_register(secretary.office_id)

        if not open_register:
            return

        cash_service.record_transaction(
            CashTransactionCreate(
                cash_register_id=open_register.id,
                type=CashTransactionType.ADJUSTMENT,
                amount=-original_tx.amount,
                payment_method=PaymentMethod.CASH,
                reference_id=pkg.id,
                reference_type="package_cancellation",
                description=f"Reversión: cancelación encomienda {pkg.tracking_number}",
            )
        )

    def get_items(self, package_id: int) -> list[PackageItem]:
        self.repo.get_by_id_or_raise(package_id, "Package")
        return self.repo.get_items(package_id)

    def add_item(self, package_id: int, item_data: dict) -> PackageItem:
        self.repo.get_by_id_or_raise(package_id, "Package")
        item_dict = item_data.model_dump()
        item_dict["total_price"] = item_dict["quantity"] * item_dict["unit_price"]
        item_dict["package_id"] = package_id
        db_item = PackageItem(**item_dict)
        self.repo.create_item(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def update_item(self, item_id: int, item_data: dict) -> PackageItem:
        db_item = self.repo.get_item_by_id(item_id)
        if not db_item:
            raise NotFoundException("Ítem de encomienda no encontrado")

        for field, value in item_data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(db_item, field, value)

        db_item.total_price = db_item.quantity * db_item.unit_price
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def delete_item(self, item_id: int) -> None:
        db_item = self.repo.get_item_by_id(item_id)
        if not db_item:
            raise NotFoundException("Ítem de encomienda no encontrado")

        count = self.repo.count_items(db_item.package_id)
        if count <= 1:
            raise ValidationException(
                "No se puede eliminar el último ítem de una encomienda. Elimine la encomienda completa."
            )

        self.repo.delete_item(db_item)
        self.db.commit()

    def search_packages(
        self, term: str, skip: int = 0, limit: int = 100
    ) -> list[Package]:
        return self.repo.search_packages(term, skip, limit)

    @staticmethod
    def to_summary(pkg: Package) -> PackageSummary:
        items_preview = []
        if getattr(pkg, "items", None):
            items_preview = pkg.items[:5]

        return PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}"
            if pkg.sender
            else None,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}"
            if pkg.recipient
            else None,
            trip_id=pkg.trip_id,
            payment_status=pkg.payment_status,
            payment_method=pkg.payment_method,
            origin_office_id=pkg.origin_office_id,
            destination_office_id=pkg.destination_office_id,
            origin_office_name=pkg.origin_office.name if pkg.origin_office else (pkg.trip.route.origin_location.name if pkg.trip and pkg.trip.route else None),
            destination_office_name=pkg.destination_office.name if pkg.destination_office else (pkg.trip.route.destination_location.name if pkg.trip and pkg.trip.route else None),
            created_at=pkg.created_at,
            items=items_preview,
        )
