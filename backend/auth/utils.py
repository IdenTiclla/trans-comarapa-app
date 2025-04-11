from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserCreate

def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica a un usuario por email y contraseña.

    Args:
        db: Sesión de base de datos
        email: Email del usuario
        password: Contraseña del usuario

    Returns:
        Usuario si la autenticación es exitosa, False en caso contrario
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not User.verify_password(password, user.hashed_password):
        return False
    return user

def create_user(db: Session, user: UserCreate):
    """
    Crea un nuevo usuario en la base de datos.

    Args:
        db: Sesión de base de datos
        user: Datos del usuario a crear

    Returns:
        Usuario creado
    """
    hashed_password = User.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        username=user.username,
        role=user.role,
        is_active=user.is_active,
        is_admin=user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
