from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from collections import defaultdict
from models.trip import Trip
from models.bus import Bus
from models.owner import Owner
from models.user import User
from models.ticket import Ticket
from models.package import Package
from models.owner_withdrawal import OwnerWithdrawal
from models.cash_transaction import CashTransaction
from services.cash_register_service import CashRegisterService
from core.exceptions import NotFoundException, ValidationException
import logging

logger = logging.getLogger(__name__)


class OwnerFinancialService:
    def __init__(self, db: Session):
        self.db = db
        self.cash_register_service = CashRegisterService(db)

    def get_owner_trips_financials(
        self, owner_id: int, bus_id: int = None
    ) -> List[Dict[str, Any]]:
        owner = self.db.query(Owner).filter(Owner.id == owner_id).first()
        if not owner:
            raise NotFoundException(f"Dueño con ID {owner_id} no encontrado")

        bus_ids = [bus.id for bus in owner.buses]
        if not bus_ids:
            return []

        if bus_id is not None:
            if bus_id not in bus_ids:
                raise ValidationException("El bus no pertenece a este socio")
            bus_ids = [bus_id]

        trips = self.db.query(Trip).filter(Trip.bus_id.in_(bus_ids)).all()

        financials = []
        for trip in trips:
            office_data = defaultdict(
                lambda: {
                    "office_name": "",
                    "tickets_amount": 0.0,
                    "packages_paid_amount": 0.0,
                    "packages_collected_amount": 0.0,
                    "packages_pending_amount": 0.0,
                    "withdrawn_amount": 0.0,
                }
            )

            def _ensure_office(oid, name):
                if not office_data[oid]["office_name"]:
                    office_data[oid]["office_name"] = name

            # 1. Boletos — dinero en la oficina de la secretaria que vendió
            tickets = self.db.query(Ticket).filter(Ticket.trip_id == trip.id).all()
            tickets_total = 0.0
            for t in tickets:
                if t.state.lower() in ("confirmed", "completed"):
                    amt = float(t.price)
                    tickets_total += amt
                    if t.secretary and t.secretary.office_id:
                        oid = t.secretary.office_id
                        _ensure_office(
                            oid,
                            t.secretary.office.name
                            if t.secretary.office
                            else f"Oficina {oid}",
                        )
                        office_data[oid]["tickets_amount"] += amt

            # 2. Encomiendas
            packages = self.db.query(Package).filter(Package.trip_id == trip.id).all()
            pkg_paid_total = 0.0
            pkg_collected_total = 0.0
            pkg_pending_total = 0.0

            for p in packages:
                amt = float(p.total_amount) if p.total_amount else 0.0
                if amt <= 0:
                    continue
                payment_status = getattr(p, "payment_status", None)
                pkg_status = getattr(p, "status", "").lower()

                # Resolver oficina de origen: origin_office_id o secretary.office_id
                origin_oid = p.origin_office_id
                origin_name = p.origin_office.name if p.origin_office else None
                if not origin_oid and p.secretary and p.secretary.office_id:
                    origin_oid = p.secretary.office_id
                    origin_name = (
                        p.secretary.office.name if p.secretary.office else None
                    )
                if origin_oid and not origin_name:
                    origin_name = f"Oficina {origin_oid}"

                # Resolver oficina de destino: destination_office_id
                dest_oid = p.destination_office_id
                dest_name = p.destination_office.name if p.destination_office else None
                if dest_oid and not dest_name:
                    dest_name = f"Oficina {dest_oid}"

                if payment_status == "paid_on_send":
                    # Pagado al enviar → dinero en oficina de origen
                    pkg_paid_total += amt
                    if origin_oid:
                        _ensure_office(origin_oid, origin_name)
                        office_data[origin_oid]["packages_paid_amount"] += amt

                elif payment_status == "collect_on_delivery":
                    if pkg_status == "delivered":
                        # Cobrado en destino → dinero en oficina de destino
                        pkg_collected_total += amt
                        if dest_oid:
                            _ensure_office(dest_oid, dest_name)
                            office_data[dest_oid]["packages_collected_amount"] += amt
                    else:
                        # Pendiente de cobro → se espera en oficina de destino
                        pkg_pending_total += amt
                        if dest_oid:
                            _ensure_office(dest_oid, dest_name)
                            office_data[dest_oid]["packages_pending_amount"] += amt

                else:
                    # Sin payment_status explícito
                    if pkg_status in ("delivered", "paid", "pagado"):
                        pkg_paid_total += amt
                        if origin_oid:
                            _ensure_office(origin_oid, origin_name)
                            office_data[origin_oid]["packages_paid_amount"] += amt
                    else:
                        pkg_pending_total += amt
                        fallback_oid = dest_oid or origin_oid
                        fallback_name = dest_name or origin_name
                        if fallback_oid:
                            _ensure_office(fallback_oid, fallback_name)
                            office_data[fallback_oid]["packages_pending_amount"] += amt

            # 3. Retiros anteriores
            withdrawals = (
                self.db.query(OwnerWithdrawal)
                .filter(
                    OwnerWithdrawal.owner_id == owner_id,
                    OwnerWithdrawal.trip_id == trip.id,
                )
                .all()
            )

            total_withdrawn = 0.0
            for w in withdrawals:
                ct = (
                    self.db.query(CashTransaction)
                    .filter(CashTransaction.id == w.cash_transaction_id)
                    .first()
                )
                if ct:
                    w_amount = float(ct.amount)
                    total_withdrawn += w_amount
                    if ct.cash_register and ct.cash_register.office_id:
                        oid = ct.cash_register.office_id
                        _ensure_office(
                            oid,
                            ct.cash_register.office.name
                            if ct.cash_register.office
                            else f"Oficina {oid}",
                        )
                        office_data[oid]["withdrawn_amount"] += w_amount

            # 4. Totales del viaje
            tickets_total = round(tickets_total, 2)
            pkg_paid_total = round(pkg_paid_total, 2)
            pkg_collected_total = round(pkg_collected_total, 2)
            pkg_pending_total = round(pkg_pending_total, 2)
            total_collected = round(
                tickets_total + pkg_paid_total + pkg_collected_total, 2
            )
            total_withdrawn = round(total_withdrawn, 2)
            available_balance = round(total_collected - total_withdrawn, 2)

            # 5. Desglose por oficina
            office_breakdown = []
            for oid, d in office_data.items():
                t_amt = round(d["tickets_amount"], 2)
                pp_amt = round(d["packages_paid_amount"], 2)
                pc_amt = round(d["packages_collected_amount"], 2)
                pend_amt = round(d["packages_pending_amount"], 2)
                w_amt = round(d["withdrawn_amount"], 2)
                collected = round(t_amt + pp_amt + pc_amt, 2)
                office_breakdown.append(
                    {
                        "office_id": oid,
                        "office_name": d["office_name"],
                        "tickets_amount": t_amt,
                        "packages_paid_amount": pp_amt,
                        "packages_collected_amount": pc_amt,
                        "packages_pending_amount": pend_amt,
                        "total_collected": collected,
                        "withdrawn_amount": w_amt,
                        "available": round(collected - w_amt, 2),
                    }
                )
            office_breakdown.sort(key=lambda x: x["office_name"])

            financials.append(
                {
                    "trip_id": trip.id,
                    "trip_datetime": trip.trip_datetime,
                    "route_origin": trip.route.origin_location.name
                    if trip.route and trip.route.origin_location
                    else "N/A",
                    "route_destination": trip.route.destination_location.name
                    if trip.route and trip.route.destination_location
                    else "N/A",
                    "bus_license_plate": trip.bus.license_plate if trip.bus else "N/A",
                    "tickets_amount": tickets_total,
                    "packages_paid_amount": pkg_paid_total,
                    "packages_collected_amount": pkg_collected_total,
                    "packages_pending_amount": pkg_pending_total,
                    "total_collected": total_collected,
                    "total_withdrawn": total_withdrawn,
                    "available_balance": available_balance,
                    "office_breakdown": office_breakdown,
                }
            )

        financials.sort(key=lambda x: x["trip_datetime"], reverse=True)
        return financials

    def process_owner_withdrawal(
        self,
        owner_id: int,
        trip_id: int,
        amount: float,
        office_id: int,
        secretary_user_id: int,
    ) -> OwnerWithdrawal:
        # Validar dueño
        owner = self.db.query(Owner).filter(Owner.id == owner_id).first()
        if not owner:
            raise NotFoundException("Dueño no encontrado")

        # Validar viaje y que pertenezca a sus buses
        trip = self.db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise NotFoundException("Viaje no encontrado")

        bus_ids = [bus.id for bus in owner.buses]
        if trip.bus_id not in bus_ids:
            raise ValidationException(
                "Este viaje no pertenece a un bus del dueño especificado"
            )

        # Verificar que el amount <= available_balance
        financials = self.get_owner_trips_financials(owner_id)
        trip_fin = next((f for f in financials if f["trip_id"] == trip_id), None)

        if not trip_fin:
            raise NotFoundException("No se encontraron finanzas para este viaje")

        if amount <= 0:
            raise ValidationException("El monto debe ser mayor a cero")

        amount = round(amount, 2)

        # Validar por oficina si se especifica office_id
        office_breakdown = trip_fin.get("office_breakdown", [])
        office_entry = next(
            (o for o in office_breakdown if o["office_id"] == office_id), None
        )
        if office_entry:
            if amount > office_entry["available"]:
                raise ValidationException(
                    f"El monto excede el saldo disponible en {office_entry['office_name']} "
                    f"({office_entry['available']:.2f})"
                )
        elif amount > trip_fin["available_balance"]:
            raise ValidationException(
                f"El monto excede el saldo disponible ({trip_fin['available_balance']:.2f})"
            )

        # Encontrar secretary de secretaria
        from models.secretary import Secretary

        secretary = (
            self.db.query(Secretary)
            .filter(Secretary.user_id == secretary_user_id)
            .first()
        )
        if not secretary:
            raise ValidationException("El usuario actual no tiene rol de Secretario")

        # Validar que el secretario pertenezca a la oficina del retiro
        if secretary.office_id != office_id:
            raise ValidationException(
                "Solo puede realizar retiros desde la oficina donde está asignado"
            )

        # Encontrar la caja abierta de la oficina
        register = self.cash_register_service.get_current_register(office_id)
        if not register:
            raise ValidationException(f"No hay caja abierta en la oficina {office_id}")

        description = f"Retiro de Socio: {owner.full_name} por Viaje ID {trip_id}"

        try:
            # Buscar el user completo para record_withdrawal
            user = self.db.query(User).filter(User.id == secretary_user_id).first()
            if not user:
                raise ValidationException("Usuario secretario no encontrado")

            # Registrar el retiro en la caja abierta
            cash_tx = self.cash_register_service.record_withdrawal(
                register_id=register.id,
                amount=amount,
                description=description,
                user=user,
            )

            # Crear el record interno de OwnerWithdrawal
            withdrawal = OwnerWithdrawal(
                owner_id=owner_id,
                trip_id=trip_id,
                cash_transaction_id=cash_tx.id,
                secretary_id=secretary.id,
            )

            self.db.add(withdrawal)
            self.db.commit()
            self.db.refresh(withdrawal)

            return withdrawal
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error procesando retiro de socio: {str(e)}")
            raise e

    def get_owner_withdrawals(
        self, owner_id: int, bus_id: int = None
    ) -> List[Dict[str, Any]]:
        owner = self.db.query(Owner).filter(Owner.id == owner_id).first()
        if not owner:
            raise NotFoundException(f"Dueño con ID {owner_id} no encontrado")

        query = self.db.query(OwnerWithdrawal).filter(
            OwnerWithdrawal.owner_id == owner_id
        )

        if bus_id is not None:
            bus_ids = [b.id for b in owner.buses]
            if bus_id not in bus_ids:
                raise ValidationException("El bus no pertenece a este socio")
            trip_ids = [
                t.id for t in self.db.query(Trip).filter(Trip.bus_id == bus_id).all()
            ]
            if not trip_ids:
                return []
            query = query.filter(OwnerWithdrawal.trip_id.in_(trip_ids))

        withdrawals = query.order_by(OwnerWithdrawal.created_at.desc()).all()

        result = []
        for w in withdrawals:
            ct = (
                self.db.query(CashTransaction)
                .filter(CashTransaction.id == w.cash_transaction_id)
                .first()
            )
            office_name = "N/A"
            if ct and ct.cash_register and ct.cash_register.office:
                office_name = ct.cash_register.office.name

            trip_info = ""
            if w.trip:
                origin = (
                    w.trip.route.origin_location.name
                    if w.trip.route and w.trip.route.origin_location
                    else "N/A"
                )
                dest = (
                    w.trip.route.destination_location.name
                    if w.trip.route and w.trip.route.destination_location
                    else "N/A"
                )
                trip_info = f"{origin} → {dest}"

            result.append(
                {
                    "id": w.id,
                    "created_at": w.created_at.isoformat() if w.created_at else None,
                    "amount": float(ct.amount) if ct else 0.0,
                    "office_name": office_name,
                    "trip_id": w.trip_id,
                    "trip_info": trip_info,
                    "bus_license_plate": w.trip.bus.license_plate
                    if w.trip and w.trip.bus
                    else "N/A",
                    "status": "PROCESSED",
                }
            )

        return result
