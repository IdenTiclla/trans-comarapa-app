from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict
from schemas.package import PackageResponse, PackageCreate, PackageUpdate, PackageSummary, PackageAssignTrip, PackageStatusUpdate, VALID_STATUSES
from schemas.package_item import PackageItemCreate, PackageItemResponse, PackageItemUpdate
from schemas.package_state_history import PackageStateHistoryCreate
from models.package import Package as PackageModel
from models.package_item import PackageItem as PackageItemModel
from models.package_state_history import PackageStateHistory as PackageStateHistoryModel
from models.secretary import Secretary as SecretaryModel
from models.trip import Trip as TripModel
from schemas.client import Client
from schemas.trip import Trip

from db.session import get_db

router = APIRouter(
    tags=["Packages"]
)

# ============================================================
# IMPORTANT: Routes with fixed paths MUST come before /{id}
# ============================================================

@router.get("/unassigned", response_model=List[PackageSummary])
async def get_unassigned_packages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtiene encomiendas sin viaje asignado (registered_at_office)"""
    packages = db.query(PackageModel).options(
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.items)
    ).filter(
        PackageModel.trip_id == None,
        PackageModel.status == "registered_at_office"
    ).offset(skip).limit(limit).all()
    
    result = []
    for pkg in packages:
        result.append(PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}" if pkg.sender else None,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}" if pkg.recipient else None,
            trip_id=pkg.trip_id,
            created_at=pkg.created_at
        ))
    
    return result

@router.get("", response_model=List[PackageSummary])
async def get_packages(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db)
):
    """Obtiene la lista de paquetes con información resumida"""
    query = db.query(PackageModel).options(
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.items)
    )
    
    if status and status.lower() != 'all':
        query = query.filter(PackageModel.status == status)
    
    packages = query.order_by(PackageModel.created_at.desc()).offset(skip).limit(limit).all()
    
    # Crear respuesta resumida
    result = []
    for pkg in packages:
        result.append(PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}" if pkg.sender else None,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}" if pkg.recipient else None,
            trip_id=pkg.trip_id,
            created_at=pkg.created_at
        ))
    
    return result

@router.post("", response_model=PackageResponse)
async def create_package(package: PackageCreate, db: Session = Depends(get_db)):
    """Crear un nuevo paquete con múltiples items (sin viaje asignado por defecto)"""
    print(f"[DEBUG] Creating package with data: {package}")
    
    # Verificar que el tracking number no exista
    existing_package = db.query(PackageModel).filter(
        PackageModel.tracking_number == package.tracking_number
    ).first()
    if existing_package:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Package with tracking number {package.tracking_number} already exists"
        )
    
    # Crear el paquete principal (trip_id puede ser None)
    package_data = package.model_dump(exclude={'items'})
    # Forzar estado inicial
    package_data['status'] = 'registered_at_office'
    db_package = PackageModel(**package_data)
    db.add(db_package)
    db.flush()  # Para obtener el ID sin hacer commit
    
    # Crear los items del paquete
    for item_data in package.items:
        item_dict = item_data.model_dump()
        item_dict['total_price'] = item_dict['quantity'] * item_dict['unit_price']
        item_dict['package_id'] = db_package.id
        
        db_item = PackageItemModel(**item_dict)
        db.add(db_item)
    
    # Registrar estado inicial en historial
    state_history = PackageStateHistoryModel(
        package_id=db_package.id,
        old_state=None,
        new_state='registered_at_office',
        changed_by_user_id=None
    )
    db.add(state_history)
    
    db.commit()
    
    # Re-query with eager loading for proper serialization
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.trip),
        joinedload(PackageModel.secretary)
    ).filter(PackageModel.id == db_package.id).first()
    
    print(f"[DEBUG] Package created successfully: {db_package.id} with {len(db_package.items)} items")
    return db_package

@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(package_id: int, db: Session = Depends(get_db)):
    """Obtener un paquete específico con todos sus items"""
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.trip),
        joinedload(PackageModel.secretary)
    ).filter(PackageModel.id == package_id).first()
    
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    return db_package

@router.get("/tracking/{tracking_number}", response_model=PackageResponse)
async def get_package_by_tracking(tracking_number: str, db: Session = Depends(get_db)):
    """Obtener un paquete por su número de tracking"""
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.trip)
    ).filter(PackageModel.tracking_number == tracking_number.upper()).first()
    
    if not db_package:
        raise HTTPException(
            status_code=404, 
            detail=f"Package with tracking number {tracking_number} not found"
        )
    
    return db_package

@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(package_id: int, package: PackageUpdate, db: Session = Depends(get_db)):
    """Actualizar información general del paquete (no items)"""
    db_package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Actualizar solo campos no nulos
    for field, value in package.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(db_package, field, value)
    
    db.commit()
    db.refresh(db_package)
    return db_package

@router.delete("/{package_id}", response_model=Dict[str, str])
async def delete_package(package_id: int, db: Session = Depends(get_db)):
    """Eliminar un paquete y todos sus items"""
    db_package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not db_package:
        raise HTTPException(status_code=404, detail="Package not found")

    tracking_number = db_package.tracking_number
    db.delete(db_package)  # Los items se eliminan automáticamente por cascade
    db.commit()

    return {"message": f"Package {tracking_number} and all its items have been successfully deleted"}

# ============================================================
# Asignación de encomiendas a viajes
# ============================================================

@router.put("/{package_id}/assign-trip", response_model=PackageResponse)
async def assign_package_to_trip(
    package_id: int,
    assign_data: PackageAssignTrip,
    db: Session = Depends(get_db)
):
    """Asigna una encomienda a un viaje. Cambia estado a 'assigned_to_trip'."""
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.secretary)
    ).filter(PackageModel.id == package_id).first()
    
    if not db_package:
        raise HTTPException(status_code=404, detail="Encomienda no encontrada")
    
    # Verificar que la encomienda esté en estado válido para asignar
    if db_package.status not in ["registered_at_office"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Solo se pueden asignar encomiendas en estado 'registered_at_office'. Estado actual: '{db_package.status}'"
        )
    
    # Verificar que el viaje exista
    trip = db.query(TripModel).filter(TripModel.id == assign_data.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    
    old_status = db_package.status
    db_package.trip_id = assign_data.trip_id
    db_package.status = "assigned_to_trip"
    
    # Registrar cambio de estado
    state_history = PackageStateHistoryModel(
        package_id=db_package.id,
        old_state=old_status,
        new_state="assigned_to_trip",
        changed_by_user_id=None
    )
    db.add(state_history)
    
    db.commit()
    db.refresh(db_package)
    return db_package

@router.put("/{package_id}/unassign-trip", response_model=PackageResponse)
async def unassign_package_from_trip(
    package_id: int,
    db: Session = Depends(get_db)
):
    """Quita una encomienda de un viaje. Vuelve a estado 'registered_at_office'."""
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.secretary)
    ).filter(PackageModel.id == package_id).first()
    
    if not db_package:
        raise HTTPException(status_code=404, detail="Encomienda no encontrada")
    
    if db_package.status not in ["assigned_to_trip"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Solo se pueden desasignar encomiendas en estado 'assigned_to_trip'. Estado actual: '{db_package.status}'"
        )
    
    old_status = db_package.status
    db_package.trip_id = None
    db_package.status = "registered_at_office"
    
    # Registrar cambio de estado
    state_history = PackageStateHistoryModel(
        package_id=db_package.id,
        old_state=old_status,
        new_state="registered_at_office",
        changed_by_user_id=None
    )
    db.add(state_history)
    
    db.commit()
    db.refresh(db_package)
    return db_package

# ============================================================
# Actualización de estado de encomiendas
# ============================================================

@router.put("/{package_id}/update-status", response_model=PackageResponse)
async def update_package_status(
    package_id: int,
    status_update: PackageStatusUpdate,
    db: Session = Depends(get_db)
):
    """Actualiza el estado de una encomienda con registro en historial."""
    db_package = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient),
        joinedload(PackageModel.trip),
        joinedload(PackageModel.secretary)
    ).filter(PackageModel.id == package_id).first()
    
    if not db_package:
        raise HTTPException(status_code=404, detail="Encomienda no encontrada")
    
    # Validar transiciones de estado válidas
    valid_transitions = {
        "registered_at_office": ["assigned_to_trip"],
        "assigned_to_trip": ["in_transit", "registered_at_office"],
        "in_transit": ["arrived_at_destination"],
        "arrived_at_destination": ["delivered"],
        "delivered": []  # Estado final
    }
    
    allowed_next = valid_transitions.get(db_package.status, [])
    if status_update.new_status not in allowed_next:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transición de estado no válida: '{db_package.status}' → '{status_update.new_status}'. "
                   f"Transiciones permitidas: {allowed_next}"
        )
    
    old_status = db_package.status
    db_package.status = status_update.new_status
    
    # Registrar cambio de estado
    state_history = PackageStateHistoryModel(
        package_id=db_package.id,
        old_state=old_status,
        new_state=status_update.new_status,
        changed_by_user_id=status_update.changed_by_user_id
    )
    db.add(state_history)
    
    db.commit()
    db.refresh(db_package)
    return db_package

# ============================================================
# Gestión de items individuales
# ============================================================

@router.get("/{package_id}/items", response_model=List[PackageItemResponse])
async def get_package_items(package_id: int, db: Session = Depends(get_db)):
    """Obtener todos los items de un paquete"""
    package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    items = db.query(PackageItemModel).filter(PackageItemModel.package_id == package_id).all()
    return items

@router.post("/{package_id}/items", response_model=PackageItemResponse)
async def add_package_item(
    package_id: int, 
    item: PackageItemCreate, 
    db: Session = Depends(get_db)
):
    """Agregar un nuevo item a un paquete existente"""
    package = db.query(PackageModel).filter(PackageModel.id == package_id).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    item_data = item.model_dump()
    item_data['total_price'] = item_data['quantity'] * item_data['unit_price']
    item_data['package_id'] = package_id
    
    db_item = PackageItemModel(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.put("/items/{item_id}", response_model=PackageItemResponse)
async def update_package_item(
    item_id: int,
    item: PackageItemUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un item específico del paquete"""
    db_item = db.query(PackageItemModel).filter(PackageItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Package item not found")
    
    # Actualizar campos
    for field, value in item.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(db_item, field, value)
    
    # Recalcular precio total si se cambió cantidad o precio unitario
    if hasattr(item, 'quantity') or hasattr(item, 'unit_price'):
        db_item.total_price = db_item.quantity * db_item.unit_price
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/items/{item_id}", response_model=Dict[str, str])
async def delete_package_item(item_id: int, db: Session = Depends(get_db)):
    """Eliminar un item específico del paquete"""
    db_item = db.query(PackageItemModel).filter(PackageItemModel.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Package item not found")
    
    # Verificar que el paquete tenga al menos 2 items (no se puede eliminar el último)
    package_items_count = db.query(PackageItemModel).filter(
        PackageItemModel.package_id == db_item.package_id
    ).count()
    
    if package_items_count <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last item of a package. Delete the entire package instead."
        )
    
    db.delete(db_item)
    db.commit()
    
    return {"message": f"Package item {item_id} has been successfully deleted"}

# ============================================================
# Filtrado por cliente y viaje
# ============================================================

@router.get("/by-sender/{client_id}", response_model=List[PackageSummary])
async def get_packages_by_sender(client_id: int, db: Session = Depends(get_db)):
    """Obtiene todos los paquetes enviados por un cliente específico."""
    packages = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.recipient)
    ).filter(PackageModel.sender_id == client_id).all()
    
    result = []
    for pkg in packages:
        result.append(PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}" if pkg.recipient else None,
            trip_id=pkg.trip_id,
            created_at=pkg.created_at
        ))
    
    return result

@router.get("/by-recipient/{client_id}", response_model=List[PackageSummary])
async def get_packages_by_recipient(client_id: int, db: Session = Depends(get_db)):
    """Obtiene todos los paquetes recibidos por un cliente específico."""
    packages = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender)
    ).filter(PackageModel.recipient_id == client_id).all()
    
    result = []
    for pkg in packages:
        result.append(PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}" if pkg.sender else None,
            trip_id=pkg.trip_id,
            created_at=pkg.created_at
        ))
    
    return result

@router.get("/by-trip/{trip_id}", response_model=List[PackageSummary])
async def get_packages_by_trip(trip_id: int, db: Session = Depends(get_db)):
    """Obtiene todos los paquetes asociados a un viaje específico."""
    packages = db.query(PackageModel).options(
        joinedload(PackageModel.items),
        joinedload(PackageModel.sender),
        joinedload(PackageModel.recipient)
    ).filter(PackageModel.trip_id == trip_id).all()
    
    result = []
    for pkg in packages:
        result.append(PackageSummary(
            id=pkg.id,
            tracking_number=pkg.tracking_number,
            status=pkg.status,
            total_amount=pkg.total_amount,
            total_items_count=pkg.total_items_count,
            sender_name=f"{pkg.sender.firstname} {pkg.sender.lastname}" if pkg.sender else None,
            recipient_name=f"{pkg.recipient.firstname} {pkg.recipient.lastname}" if pkg.recipient else None,
            trip_id=pkg.trip_id,
            created_at=pkg.created_at
        ))
    
    return result
