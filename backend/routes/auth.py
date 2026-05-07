from datetime import timedelta
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from db.session import get_db
from auth.jwt import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user, get_current_admin_user, get_current_user_with_token_data, get_user_from_refresh_token
from auth.blacklist import token_blacklist
from schemas.auth import AuthSuccessResponse
from schemas.user import User as UserSchema, UserCreate
from models.user import User as UserModel
from services.auth_service import AuthService
from core.config import settings

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
    is_production = not settings.DEBUG
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
        max_age=settings.refresh_token_expire_seconds,
        path="/api/v1/auth/refresh",
        **cookie_settings
    )

@router.post("/login", response_model=AuthSuccessResponse)
def login_for_access_token(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_service)
):
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Nombre de usuario y contraseña son obligatorios",
            headers={"WWW-Authenticate": "Bearer"},
        )

    client_ip = get_remote_address(request)
    user = service.authenticate_user(form_data.username, form_data.password, client_ip=client_ip)
    logger.info(f"Successful login for {form_data.username} from {client_ip}")

    token_data = service.build_token_data(user, is_refresh=False)
    refresh_token_data = service.build_token_data(user, is_refresh=True)

    access_token = create_access_token(
        data=token_data,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    refresh_token = create_access_token(
        data=refresh_token_data,
        expires_delta=timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )

    _set_auth_cookies(response, access_token, refresh_token)

    return service.build_response_body(user)

@router.post("/logout")
def logout(response: Response, user_data: tuple = Depends(get_current_user_with_token_data)):
    current_user, token_data = user_data
    
    if token_data.jti:
        token_blacklist.add_token_to_blacklist(token_data.jti)
        logger.info(f"User {current_user.email} logged out, token JTI {token_data.jti} blacklisted")
    
    is_production = not settings.DEBUG
    response.delete_cookie(key="access_token", httponly=True, secure=is_production, samesite="strict")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth/refresh", httponly=True, secure=is_production, samesite="strict")
    
    logger.info(f"Cookies httpOnly limpiadas para usuario {current_user.email}")
    return {"message": "Logout successful"}

@router.post("/refresh", response_model=AuthSuccessResponse)
@limiter.limit(settings.RATE_LIMIT_DEFAULT if settings.TESTING else settings.RATE_LIMIT_AUTH_REFRESH)
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
        expires_delta=timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    )

    _set_auth_cookies(response, access_token, refresh_token)

    return service.build_response_body(current_user)


@router.post("/register", response_model=UserSchema)
@limiter.limit(settings.RATE_LIMIT_DEFAULT if settings.TESTING else settings.RATE_LIMIT_AUTH_REGISTER)
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

@router.post("/users", response_model=UserSchema)
def create_new_user(user: UserCreate, service: AuthService = Depends(get_service), _: UserModel = Depends(get_current_admin_user)):
    return service.register_user(user.model_dump())
