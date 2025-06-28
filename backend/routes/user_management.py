from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.session import get_db
from models.user import User, UserRole
from models.secretary import Secretary
from models.administrator import Administrator
from models.driver import Driver
from models.assistant import Assistant
from models.client import Client
from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from schemas.role import RoleList
from schemas.profile import UnifiedProfileResponse, ProfileUpdateRequest
from auth.jwt import get_current_admin_user as get_current_active_admin, get_current_user

router = APIRouter()

# Obtener todos los usuarios con filtrado y paginación
@router.get("/users", response_model=UserListResponse)
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Obtiene una lista paginada de usuarios con opciones de filtrado.
    Solo accesible por administradores.
    """
    query = db.query(User)

    # Aplicar filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                User.firstname.ilike(search_term),
                User.lastname.ilike(search_term),
                User.email.ilike(search_term),
                User.username.ilike(search_term)
            )
        )

    if role:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    # Contar total de resultados
    total = query.count()

    # Aplicar paginación
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    # Construir respuesta
    return {
        "items": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

# Obtener un usuario por ID
@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Obtiene los detalles de un usuario específico por su ID.
    Solo accesible por administradores.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Simplificamos la respuesta para evitar problemas con las relaciones
    # Construir respuesta
    response = UserResponse.from_orm(user)

    return response

# Crear un nuevo usuario
@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Crea un nuevo usuario en el sistema.
    Solo accesible por administradores.
    """
    # Verificar si el email ya existe
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Verificar si el username ya existe
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )

    # Crear el usuario
    new_user = User(
        firstname=user_data.firstname,
        lastname=user_data.lastname,
        email=user_data.email,
        username=user_data.username,
        role=user_data.role,
        is_active=user_data.is_active,
        is_admin=user_data.is_admin
    )
    new_user.set_password(user_data.password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If the new user is a secretary, create an associated secretary record
    if new_user.role == UserRole.SECRETARY:
        secretary_data = Secretary(
            firstname=new_user.firstname,
            lastname=new_user.lastname,
            user_id=new_user.id,
        )
        db.add(secretary_data)
        db.commit()
        db.refresh(secretary_data)

    return new_user

# Actualizar un usuario existente
@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Actualiza los datos de un usuario existente.
    Solo accesible por administradores.
    """
    # Buscar el usuario
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Verificar si el email ya existe (si se está cambiando)
    if user_data.email and user_data.email != user.email:
        existing_email = db.query(User).filter(User.email == user_data.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

    # Verificar si el username ya existe (si se está cambiando)
    if user_data.username and user_data.username != user.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )

    # Actualizar los campos del usuario
    if user_data.firstname is not None:
        user.firstname = user_data.firstname
    if user_data.lastname is not None:
        user.lastname = user_data.lastname
    if user_data.email is not None:
        user.email = user_data.email
    if user_data.username is not None:
        user.username = user_data.username
    if user_data.role is not None:
        user.role = user_data.role
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin
    if user_data.password:
        user.set_password(user_data.password)

    db.commit()
    db.refresh(user)

    return user

# Eliminar un usuario
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Elimina un usuario del sistema.
    Solo accesible por administradores.
    """
    # Buscar el usuario
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # No permitir eliminar al propio usuario
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario"
        )

    # Eliminar el usuario
    db.delete(user)
    db.commit()

    return None

# Activar un usuario
@router.patch("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Activa un usuario desactivado.
    Solo accesible por administradores.
    """
    # Buscar el usuario
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # Activar el usuario
    user.is_active = True
    db.commit()
    db.refresh(user)

    return user

# Desactivar un usuario
@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
):
    """
    Desactiva un usuario activo.
    Solo accesible por administradores.
    """
    # Buscar el usuario
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    # No permitir desactivar al propio usuario
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario"
        )

    # Desactivar el usuario
    user.is_active = False
    db.commit()
    db.refresh(user)

    return user

# Obtener todos los roles disponibles
@router.get("/roles", response_model=RoleList)
def get_roles(
    current_user: User = Depends(get_current_active_admin)
):
    """
    Obtiene la lista de roles disponibles en el sistema.
    Solo accesible por administradores.
    """
    # Obtener los roles directamente del enum UserRole
    roles = [role.value for role in UserRole]
    return {"roles": roles}

# ==== FASE 3: ENDPOINTS UNIFICADOS DE PERFIL ====

@router.get("/users/me/profile", response_model=UnifiedProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil completo del usuario autenticado.
    Combina datos de User y Person en una respuesta unificada.
    
    Reemplaza los endpoints antiguos:
    - /users/me/person
    - /users/me/secretary  
    - /users/me/driver
    - /users/me/assistant
    - /users/me/client
    """
    # Buscar la entidad Person asociada según el rol
    person_data = None
    person_entity = None
    
    if current_user.role == UserRole.ADMIN:
        person_entity = db.query(Administrator).filter(Administrator.user_id == current_user.id).first()
    elif current_user.role == UserRole.SECRETARY:
        person_entity = db.query(Secretary).filter(Secretary.user_id == current_user.id).first()
    elif current_user.role == UserRole.DRIVER:
        person_entity = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    elif current_user.role == UserRole.ASSISTANT:
        person_entity = db.query(Assistant).filter(Assistant.user_id == current_user.id).first()
    elif current_user.role == UserRole.CLIENT:
        person_entity = db.query(Client).filter(Client.user_id == current_user.id).first()
    
    if person_entity:
        # Convertir la entidad person a diccionario incluyendo campos específicos del rol
        person_data = {
            "id": person_entity.id,
            "firstname": person_entity.firstname,
            "lastname": person_entity.lastname,
            "phone": person_entity.phone,
            "birth_date": person_entity.birth_date,
            "bio": getattr(person_entity, 'bio', None),
            "type": current_user.role.value.lower(),
            "created_at": person_entity.created_at,
            "updated_at": person_entity.updated_at
        }
        
        # Agregar campos específicos según el rol
        if current_user.role == UserRole.DRIVER:
            person_data.update({
                "license_number": person_entity.license_number,
                "license_type": person_entity.license_type,
                "license_expiry": person_entity.license_expiry,
                "status": person_entity.status
            })
        elif current_user.role == UserRole.CLIENT:
            person_data.update({
                "document_id": person_entity.document_id,
                "address": person_entity.address,
                "city": person_entity.city,
                "state": person_entity.state,
                "is_minor": getattr(person_entity, 'is_minor', None)
            })
        elif current_user.role == UserRole.SECRETARY:
            person_data.update({
                "office_id": person_entity.office_id
            })
    
    # Construir respuesta unificada
    response_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
        "person": person_data,
        # Campos de compatibilidad
        "firstname": person_data.get("firstname") if person_data else current_user.firstname,
        "lastname": person_data.get("lastname") if person_data else current_user.lastname,
        "phone": person_data.get("phone") if person_data else None,
        "birth_date": person_data.get("birth_date") if person_data else None
    }
    
    return response_data

@router.put("/users/me/profile", response_model=UnifiedProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza el perfil del usuario autenticado.
    Permite actualizar tanto datos del User como del Person asociado.
    """
    # Actualizar datos del usuario si se proporcionan
    user_updated = False
    if profile_data.email and profile_data.email != current_user.email:
        # Verificar que el email no esté en uso
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está en uso por otro usuario"
            )
        current_user.email = profile_data.email
        user_updated = True
    
    if user_updated:
        db.commit()
        db.refresh(current_user)
    
    # Buscar y actualizar la entidad Person asociada
    person_entity = None
    if current_user.role == UserRole.ADMIN:
        person_entity = db.query(Administrator).filter(Administrator.user_id == current_user.id).first()
    elif current_user.role == UserRole.SECRETARY:
        person_entity = db.query(Secretary).filter(Secretary.user_id == current_user.id).first()
    elif current_user.role == UserRole.DRIVER:
        person_entity = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    elif current_user.role == UserRole.ASSISTANT:
        person_entity = db.query(Assistant).filter(Assistant.user_id == current_user.id).first()
    elif current_user.role == UserRole.CLIENT:
        person_entity = db.query(Client).filter(Client.user_id == current_user.id).first()
    
    if person_entity:
        person_updated = False
        
        # Actualizar campos básicos de Person
        if profile_data.firstname is not None:
            person_entity.firstname = profile_data.firstname
            person_updated = True
        if profile_data.lastname is not None:
            person_entity.lastname = profile_data.lastname
            person_updated = True
        if profile_data.phone is not None:
            person_entity.phone = profile_data.phone
            person_updated = True
        if profile_data.birth_date is not None:
            person_entity.birth_date = profile_data.birth_date
            person_updated = True
        if profile_data.bio is not None:
            if hasattr(person_entity, 'bio'):
                person_entity.bio = profile_data.bio
                person_updated = True
        
        # Actualizar campos específicos del rol si se proporcionan
        if profile_data.role_specific_data:
            role_data = profile_data.role_specific_data
            
            if current_user.role == UserRole.DRIVER:
                if "license_number" in role_data:
                    person_entity.license_number = role_data["license_number"]
                    person_updated = True
                if "license_type" in role_data:
                    person_entity.license_type = role_data["license_type"]
                    person_updated = True
                if "license_expiry" in role_data:
                    person_entity.license_expiry = role_data["license_expiry"]
                    person_updated = True
                if "status" in role_data:
                    person_entity.status = role_data["status"]
                    person_updated = True
            elif current_user.role == UserRole.CLIENT:
                if "document_id" in role_data:
                    person_entity.document_id = role_data["document_id"]
                    person_updated = True
                if "address" in role_data:
                    person_entity.address = role_data["address"]
                    person_updated = True
                if "city" in role_data:
                    person_entity.city = role_data["city"]
                    person_updated = True
                if "state" in role_data:
                    person_entity.state = role_data["state"]
                    person_updated = True
        
        if person_updated:
            db.commit()
            db.refresh(person_entity)
    
    # Retornar el perfil actualizado
    return get_my_profile(current_user, db)
