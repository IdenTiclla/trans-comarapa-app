from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from db.session import get_db
from auth.jwt import get_current_admin_user, get_current_user
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from schemas.role import RoleList
from schemas.profile import UnifiedProfileResponse, ProfileUpdateRequest
from services.user_management_service import UserManagementService

router = APIRouter()

def get_service(db=Depends(get_db)) -> UserManagementService:
    return UserManagementService(db)

@router.get("/users", response_model=UserListResponse)
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Obtiene una lista paginada de usuarios con opciones de filtrado."""
    users, total = service.get_users(skip=skip, limit=limit, search=search, role=role, is_active=is_active)
    return {
        "items": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Obtiene los detalles de un usuario específico por su ID."""
    user = service.get_by_id(user_id)
    return UserResponse.model_validate(user)

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Crea un nuevo usuario en el sistema."""
    return service.create_user(user_data.model_dump())

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Actualiza los datos de un usuario existente."""
    return service.update_user(user_id, user_data.model_dump(exclude_unset=True))

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Elimina un usuario del sistema."""
    service.delete_user(user_id, current_user.id)
    return None

@router.patch("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: int,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Activa un usuario desactivado."""
    return service.activate_user(user_id)

@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: int,
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Desactiva un usuario activo."""
    return service.deactivate_user(user_id, current_user.id)

@router.get("/roles", response_model=RoleList)
def get_roles(
    service: UserManagementService = Depends(get_service),
    current_user: User = Depends(get_current_admin_user)
):
    """Obtiene la lista de roles disponibles en el sistema."""
    return {"roles": service.get_available_roles()}

@router.get("/users/me/profile", response_model=UnifiedProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    service: UserManagementService = Depends(get_service)
):
    """Obtiene el perfil completo del usuario autenticado."""
    return service.get_my_profile(current_user)

@router.put("/users/me/profile", response_model=UnifiedProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: UserManagementService = Depends(get_service)
):
    """Actualiza el perfil del usuario autenticado."""
    return service.update_my_profile(current_user, profile_data.model_dump(exclude_unset=True))
