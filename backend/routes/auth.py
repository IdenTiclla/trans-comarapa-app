from datetime import timedelta
import os
import logging
from typing import Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from db.session import get_db
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user, get_token, get_current_user_with_token_data, get_user_from_refresh_token
from auth.blacklist import token_blacklist
from auth.utils import create_user
from schemas.auth import TokenWithRoleInfo
from schemas.user import User as UserSchema, UserCreate
from schemas.secretary import Secretary as SecretarySchema
from models.user import User as UserModel
from services.auth_service import AuthService

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

def get_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)

def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Configurar cookies con las mejores prácticas de seguridad"""
    is_production = os.getenv("DEBUG", "true").lower() != "true"
    cookie_settings = {
        "httponly": True,
        "secure": is_production,
        "samesite": "strict"
    }
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_settings
    )
    
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token,
        max_age=7 * 24 * 60 * 60,
        path="/api/v1/auth/refresh",
        **cookie_settings
    )

@router.post("/login", response_model=TokenWithRoleInfo)
def login_for_access_token(
    request: Request, 
    response: Response, 
    form_data: OAuth2PasswordRequestForm = Depends(), 
    service: AuthService = Depends(get_service)
):
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Username and password are required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = service.authenticate_user(form_data.username, form_data.password)
    client_ip = get_remote_address(request)
    logger.info(f"Successful login for {form_data.username} from {client_ip}")

    token_data = service.build_token_data(user, is_refresh=False)
    refresh_token_data = service.build_token_data(user, is_refresh=True)

    access_token = create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=timedelta(days=7)
    )

    _set_auth_cookies(response, access_token, refresh_token)
    logger.info(f"Cookies httpOnly establecidas para usuario {user.email}")

    return service.build_response_body(user, access_token, refresh_token)

@router.post("/logout")
def logout(response: Response, user_data: tuple = Depends(get_current_user_with_token_data)):
    current_user, token_data = user_data
    
    if token_data.jti:
        token_blacklist.add_token_to_blacklist(token_data.jti)
        logger.info(f"User {current_user.email} logged out, token JTI {token_data.jti} blacklisted")
    
    is_production = os.getenv("DEBUG", "true").lower() != "true"
    response.delete_cookie(key="access_token", httponly=True, secure=is_production, samesite="strict")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh", httponly=True, secure=is_production, samesite="strict")
    
    logger.info(f"Cookies httpOnly limpiadas para usuario {current_user.email}")
    return {"message": "Logout successful"}

@router.post("/refresh", response_model=TokenWithRoleInfo)
@limiter.limit("100/minute" if os.getenv("TESTING", "false").lower() == "true" else "10/minute")
def refresh_token(
    request: Request, 
    response: Response, 
    current_user: UserModel = Depends(get_user_from_refresh_token), 
    service: AuthService = Depends(get_service)
):
    token_data = service.build_token_data(current_user, is_refresh=False)
    refresh_token_data = service.build_token_data(current_user, is_refresh=True)

    access_token = create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=timedelta(days=7)
    )

    _set_auth_cookies(response, access_token, refresh_token)
    logger.info(f"Cookies httpOnly actualizadas para usuario {current_user.email}")

    return service.build_response_body(current_user, access_token, refresh_token)


@router.post("/register", response_model=UserSchema)
@limiter.limit("100/minute" if os.getenv("TESTING", "false").lower() == "true" else "3/minute")
def register_user(
    request: Request, 
    user: UserCreate, 
    service: AuthService = Depends(get_service)
):
    return service.register_user(user.model_dump())

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: UserModel = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(
    user_update: UserCreate, 
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    return service.update_user_profile(current_user, user_update.model_dump(exclude_unset=True))

@router.get("/me/person", response_model=dict)
def get_current_user_person(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No person is associated with the current user (role: {current_user.role})"
        )
    
    role_str = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)
    result = {
        "role": current_user.role,
        "entity_id": entity.id,
        "entity_type": role_str,
        "entity_data": {
            "id": entity.id,
            "firstname": getattr(entity, 'firstname', ''),
            "lastname": getattr(entity, 'lastname', ''),
            "email": current_user.email,
            "phone": getattr(entity, 'phone', None)
        },
        "firstname": current_user.firstname or "",
        "lastname": current_user.lastname or ""
    }
    
    if role_str == "driver":
        result["entity_data"].update({
            "license_number": getattr(entity, 'license_number', None),
            "experience_years": getattr(entity, 'experience_years', None)
        })
    elif role_str == "client":
        result["entity_data"].update({
            "address": getattr(entity, 'address', None),
            "city": getattr(entity, 'city', None),
            "state": getattr(entity, 'state', None)
        })
        
    return result

@router.get("/me/secretary", response_model=SecretarySchema)
def get_current_user_secretary(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    if current_user.role != "secretary" and getattr(current_user.role, 'value', None) != "secretary":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a secretary"
        )
    
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No secretary is associated with the current user"
        )
    return entity

@router.get("/me/driver", response_model=dict)
def get_current_user_driver(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    if current_user.role != "driver" and getattr(current_user.role, 'value', None) != "driver":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not a driver")
        
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No driver is associated with the current user")
        
    return {
        "id": entity.id,
        "firstname": entity.firstname,
        "lastname": entity.lastname,
        "email": current_user.email,
        "phone": entity.phone,
        "license_number": entity.license_number,
        "experience_years": entity.experience_years
    }

@router.get("/me/assistant", response_model=dict)
def get_current_user_assistant(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    if current_user.role != "assistant" and getattr(current_user.role, 'value', None) != "assistant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an assistant")
        
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No assistant is associated with the current user")
        
    return {
        "id": entity.id,
        "firstname": entity.firstname,
        "lastname": entity.lastname,
        "email": current_user.email,
        "phone": entity.phone
    }

@router.get("/me/client", response_model=dict)
def get_current_user_client(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    if current_user.role != "client" and getattr(current_user.role, 'value', None) != "client":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not a client")
        
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No client is associated with the current user")
        
    return {
        "id": entity.id,
        "firstname": entity.firstname,
        "lastname": entity.lastname,
        "email": current_user.email,
        "phone": entity.phone,
        "address": entity.address,
        "city": entity.city,
        "state": entity.state
    }

@router.get("/me/administrator", response_model=dict)
def get_current_user_administrator(
    current_user: UserModel = Depends(get_current_user), 
    service: AuthService = Depends(get_service)
):
    if current_user.role != "admin" and getattr(current_user.role, 'value', None) != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not an administrator")
        
    entity = service.get_user_person_info(current_user)
    if not entity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No administrator is associated with the current user")
        
    return {
        "id": entity.id,
        "firstname": entity.firstname,
        "lastname": entity.lastname,
        "email": current_user.email,
        "phone": entity.phone
    }

@router.post("/users", response_model=UserSchema)
def create_new_user(user: UserCreate, service: AuthService = Depends(get_service), _: UserModel = Depends(get_current_admin_user)):
    return service.register_user(user.model_dump())

@router.get("/verify")
def verify_token(current_user: UserModel = Depends(get_current_user)):
    return {
        "valid": True,
        "user_id": current_user.id,
        "email": current_user.email,
        "role": str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role),
        "is_active": current_user.is_active,
        "firstname": current_user.effective_firstname or "",
        "lastname": current_user.effective_lastname or "",
        "person": {
            "id": current_user.person.id,
            "type": current_user.person.type,
            "phone": current_user.person.phone,
            "avatar_url": current_user.person.avatar_url
        } if getattr(current_user, 'person', None) else None
    }
