import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from db.session import get_db
from models.activity import Activity as ActivityModel
from models.user import User as UserModel # Para la dependencia de usuario
from schemas.activity import Activity as ActivitySchema, ActivityCreate, ActivityListResponse
# Asumiendo que tienes un esquema para User si quieres popular la info del usuario
# from schemas.user import User as UserSchema 
from auth.jwt import get_current_admin_user # Importar la dependencia correcta

router = APIRouter(
    prefix="/activities",
    tags=["Activities"]
)

logger = logging.getLogger(__name__)

# Helper function to log an activity (puedes llamarla desde otros servicios/rutas)
async def log_activity(
    db: Session,
    activity_type: str,
    details: Optional[str] = None,
    user_id: Optional[int] = None
):
    activity_data = ActivityCreate(activity_type=activity_type, details=details, user_id=user_id)
    db_activity = ActivityModel(**activity_data.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

@router.get("/recent", response_model=ActivityListResponse)
async def get_recent_activities(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100, description="Número de actividades recientes a retornar")
):
    """
    Obtener las actividades más recientes del sistema.

    - **limit**: Número máximo de actividades a retornar (por defecto 10, máximo 100).
    """
    try:
        query = db.query(ActivityModel).order_by(desc(ActivityModel.created_at)).limit(limit)
        activities = query.all()
        total_activities_in_query = len(activities) # O podrías hacer un count separado si "limit" es muy grande
        
        # Aquí podrías querer popular la información del usuario si es necesario
        # Por ejemplo, si tu esquema ActivitySchema incluye un campo `user: Optional[UserSchema]`
        # y tu modelo ActivityModel tiene una relación `user`.
        # activities_response = []
        # for act in activities:
        #     activity_dict = act.__dict__ # o usa el esquema para convertir
        #     if act.user:
        #         activity_dict['user'] = UserSchema.from_orm(act.user)
        #     activities_response.append(ActivitySchema.from_orm(act))
        # activities = activities_response

        return ActivityListResponse(activities=[ActivitySchema.from_orm(act) for act in activities], total=total_activities_in_query)
    except Exception as e:
        # Log el error e
        logger.error("Error fetching recent activities: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error al obtener las actividades recientes."
        )

# Endpoint de ejemplo para crear una actividad (protegido)
# Puedes usar la función log_activity directamente en tu código de backend
# donde necesites registrar una acción, en lugar de llamar a este endpoint.
@router.post("/", response_model=ActivitySchema, status_code=status.HTTP_201_CREATED)
async def create_activity_endpoint(
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_admin: UserModel = Depends(get_current_admin_user) # Usar la dependencia correcta
):
    """
    Registrar una nueva actividad. (Principalmente para testing o usos específicos)
    Se recomienda usar `log_activity` directamente en el backend.

    Requiere autenticación como administrador.
    """
    # Si quieres asociar la actividad al usuario autenticado (admin en este caso):
    user_id_to_log = current_admin.id if current_admin else activity_in.user_id
    
    db_activity = await log_activity(db, activity_type=activity_in.activity_type, details=activity_in.details, user_id=user_id_to_log)
    return ActivitySchema.from_orm(db_activity) 