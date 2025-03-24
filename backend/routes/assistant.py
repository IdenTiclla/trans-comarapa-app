from fastapi import APIRouter, status, Depends, HTTPException
from models.assistant import Assistant
from schemas.assistant import AssistantCreate, Assistant as AssistantSchema
from sqlalchemy.orm import Session
from db.session import get_db


router = APIRouter(
    prefix='/assistants',
    tags=['Assistants']    
)

@router.get(
    '',
    response_model=list[AssistantSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all the assistants.",
    description="This endpoint is used to see all the assistants on the platform."
)
def get_all_assistants(db: Session = Depends(get_db)):
    assistants = db.query(Assistant).all()
    return assistants

@router.post(
    '',
    response_model=AssistantSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assistant.",
    description="This endpoint is used to create a new trip assistant."
)
def create_assistant(assistant: AssistantCreate, db: Session = Depends(get_db)):
    existing_assistant = db.query(Assistant).filter(Assistant.phone_number == assistant.phone_number).first()
    if existing_assistant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already exists."
        )
    assistant = Assistant(**assistant.model_dump())
    db.add(assistant)
    db.commit()
    db.refresh(assistant)
    return assistant