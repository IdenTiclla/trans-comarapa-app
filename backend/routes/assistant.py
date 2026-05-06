from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from db.session import get_db
from auth.jwt import get_current_user
from models.user import User
from schemas.assistant import AssistantCreate, AssistantPatch, Assistant as AssistantSchema
from services.assistant_service import AssistantService

router = APIRouter(tags=["Assistants"])


def get_service(db: Session = Depends(get_db)) -> AssistantService:
    return AssistantService(db)


@router.get("", response_model=list[AssistantSchema], status_code=status.HTTP_200_OK)
def get_all_assistants(
    service: AssistantService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_all()


@router.get("/{assistant_id}", response_model=AssistantSchema)
def get_assistant(
    assistant_id: int,
    service: AssistantService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.get_by_id(assistant_id)


@router.post("", response_model=AssistantSchema, status_code=status.HTTP_201_CREATED)
def create_assistant(
    assistant: AssistantCreate,
    service: AssistantService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.create(assistant.model_dump())


@router.patch("/{assistant_id}", response_model=AssistantSchema)
def patch_assistant(
    assistant: AssistantPatch,
    assistant_id: int,
    service: AssistantService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.update(assistant_id, assistant.dict(exclude_unset=True))


@router.delete("/{assistant_id}", response_model=AssistantSchema)
def delete_assistant(
    assistant_id: int,
    service: AssistantService = Depends(get_service),
    current_user: User = Depends(get_current_user),
):
    return service.delete(assistant_id)
