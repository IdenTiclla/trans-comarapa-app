from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from db.session import get_db
from models.person import Person
from models.driver import Driver
from models.client import Client
from models.secretary import Secretary
from models.assistant import Assistant
from models.administrator import Administrator
from schemas.person import (
    PersonResponse, PersonUpdate, PersonCreate, 
    DriverResponse, ClientResponse, SecretaryResponse, 
    AssistantResponse, AdministratorResponse,
    DriverUpdate, ClientUpdate, PersonType
)
from auth.jwt import get_current_user, get_current_admin_user
from models.user import User

router = APIRouter(prefix="/persons", tags=["Persons"])

@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener información de una persona por ID.
    
    Args:
        person_id: ID de la persona
        db: Sesión de base de datos
        current_user: Usuario actual
        
    Returns:
        Información de la persona
    """
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona no encontrada"
        )
    
    # Verificar permisos: admin puede ver cualquier persona, 
    # usuarios normales solo pueden ver su propia persona
    if not current_user.is_admin and person.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta persona"
        )
    
    return person

@router.get("/by-user/{user_id}", response_model=PersonResponse)
async def get_person_by_user_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener información de una persona por el ID del usuario asociado.
    
    Args:
        user_id: ID del usuario
        db: Sesión de base de datos
        current_user: Usuario actual
        
    Returns:
        Información de la persona asociada al usuario
    """
    person = db.query(Person).filter(Person.user_id == user_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró persona asociada a este usuario"
        )
    
    # Verificar permisos
    if not current_user.is_admin and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver esta persona"
        )
    
    return person

@router.put("/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: int,
    person_data: PersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar información de una persona.
    
    Args:
        person_id: ID de la persona
        person_data: Datos a actualizar
        db: Sesión de base de datos
        current_user: Usuario actual
        
    Returns:
        Persona actualizada
    """
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona no encontrada"
        )
    
    # Verificar permisos
    if not current_user.is_admin and person.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar esta persona"
        )
    
    # Actualizar campos
    for field, value in person_data.model_dump(exclude_unset=True).items():
        setattr(person, field, value)
    
    db.commit()
    db.refresh(person)
    return person

@router.get("/", response_model=List[PersonResponse])
async def list_persons(
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(100, ge=1, le=1000, description="Número máximo de registros a retornar"),
    person_type: Optional[PersonType] = Query(None, description="Filtrar por tipo de persona"),
    search: Optional[str] = Query(None, description="Buscar por nombre o apellido"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Listar personas con filtros opcionales (solo administradores).
    
    Args:
        skip: Número de registros a saltar
        limit: Número máximo de registros a retornar
        person_type: Filtrar por tipo de persona
        search: Buscar por nombre o apellido
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser admin)
        
    Returns:
        Lista de personas
    """
    query = db.query(Person)
    
    # Filtrar por tipo si se especifica
    if person_type:
        query = query.filter(Person.type == person_type.value)
    
    # Filtrar por búsqueda de nombre si se especifica
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            db.func.concat(Person.firstname, ' ', Person.lastname).ilike(search_pattern)
        )
    
    # Aplicar paginación
    persons = query.offset(skip).limit(limit).all()
    return persons

@router.post("/", response_model=PersonResponse)
async def create_person(
    person_data: PersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Crear una nueva persona (solo administradores).
    
    Args:
        person_data: Datos de la persona a crear
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser admin)
        
    Returns:
        Persona creada
    """
    # Verificar que el usuario existe
    user = db.query(User).filter(User.id == person_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Verificar que no existe ya una persona para este usuario
    existing_person = db.query(Person).filter(Person.user_id == person_data.user_id).first()
    if existing_person:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una persona asociada a este usuario"
        )
    
    # Crear la persona específica según el tipo
    person_dict = person_data.model_dump()
    person_type = person_dict.pop('type')
    
    if person_type == PersonType.DRIVER:
        person = Driver(**person_dict)
    elif person_type == PersonType.CLIENT:
        person = Client(**person_dict)
    elif person_type == PersonType.SECRETARY:
        person = Secretary(**person_dict)
    elif person_type == PersonType.ASSISTANT:
        person = Assistant(**person_dict)
    elif person_type == PersonType.ADMINISTRATOR:
        person = Administrator(**person_dict)
    else:
        person = Person(**person_dict)
    
    db.add(person)
    db.commit()
    db.refresh(person)
    return person

# Endpoints específicos para diferentes tipos de personas

@router.get("/drivers/", response_model=List[DriverResponse])
async def list_drivers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None, description="Filtrar por estado del conductor"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Listar conductores con filtros opcionales."""
    query = db.query(Driver)
    
    if status_filter:
        query = query.filter(Driver.status == status_filter)
    
    drivers = query.offset(skip).limit(limit).all()
    return drivers

@router.get("/clients/", response_model=List[ClientResponse])
async def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    city: Optional[str] = Query(None, description="Filtrar por ciudad"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Listar clientes con filtros opcionales."""
    query = db.query(Client)
    
    if city:
        query = query.filter(Client.city.ilike(f"%{city}%"))
    
    clients = query.offset(skip).limit(limit).all()
    return clients

@router.get("/secretaries/", response_model=List[SecretaryResponse])
async def list_secretaries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    office_id: Optional[int] = Query(None, description="Filtrar por ID de oficina"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Listar secretarias con filtros opcionales."""
    query = db.query(Secretary)
    
    if office_id:
        query = query.filter(Secretary.office_id == office_id)
    
    secretaries = query.offset(skip).limit(limit).all()
    return secretaries

# Endpoints para actualizar tipos específicos

@router.put("/drivers/{driver_id}", response_model=DriverResponse)
async def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar información específica de un conductor."""
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conductor no encontrado"
        )
    
    # Verificar permisos
    if not current_user.is_admin and driver.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este conductor"
        )
    
    # Actualizar campos
    for field, value in driver_data.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    
    db.commit()
    db.refresh(driver)
    return driver

@router.put("/clients/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Actualizar información específica de un cliente."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente no encontrado"
        )
    
    # Verificar permisos
    if not current_user.is_admin and client.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este cliente"
        )
    
    # Actualizar campos
    for field, value in client_data.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_person(
    person_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Eliminar una persona (solo administradores).
    
    Args:
        person_id: ID de la persona a eliminar
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser admin)
    """
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona no encontrada"
        )
    
    db.delete(person)
    db.commit()
    return None

@router.get("/stats/summary", response_model=dict)
async def get_persons_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Obtener estadísticas resumen de personas por tipo.
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario actual (debe ser admin)
        
    Returns:
        Estadísticas de personas agrupadas por tipo
    """
    stats = {}
    
    # Contar por cada tipo de persona
    for person_type in PersonType:
        count = db.query(Person).filter(Person.type == person_type.value).count()
        stats[person_type.value] = count
    
    # Total general
    total = db.query(Person).count()
    stats['total'] = total
    
    return stats