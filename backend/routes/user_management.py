from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.session import get_db
from models.user import User, UserRole
from models.secretary import Secretary
from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from schemas.role import RoleList
from auth.jwt import get_current_admin_user as get_current_active_admin

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
