from fastapi import APIRouter, status, Depends, HTTPException
from models.assistant import Assistant as AssistantModel
from schemas.assistant import AssistantCreate, Assistant as AssistantSchema
from sqlalchemy.orm import Session
from db.session import get_db


router = APIRouter(
    prefix="/assistants",
    tags=["Assistants"]
)

@router.get(
    '',
    response_model=list[AssistantSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all the assistants.",
    description="This endpoint is used to see all the assistants on the platform."
)
def get_all_assistants(db: Session = Depends(get_db)):
    assistants = db.query(AssistantModel).all()
    return assistants

@router.get("/{assistant_id}", response_model=AssistantSchema)
async def get_assistant(assistant_id: int, db: Session = Depends(get_db)):
    assistant = db.query(AssistantModel).filter(AssistantModel.id == assistant_id).first()
    if not assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assistant with id {assistant_id} not found"
        )
    return assistant

@router.delete("/{assistant_id}", response_model=AssistantSchema)
async def delete_assistant(assistant_id:int, db: Session = Depends(get_db)):
    db_assistant = db.query(AssistantModel).filter(AssistantModel.id == assistant_id).first()
    if not db_assistant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assistant with id {assistant_id} not found"
        )
    db.delete(db_assistant)
    db.commit()
    return db_assistant


@router.post(
    '',
    response_model=AssistantSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assistant.",
    description="This endpoint is used to create a new trip assistant."
)
def create_assistant(assistant: AssistantCreate, db: Session = Depends(get_db)):
    existing_assistant = db.query(AssistantModel).filter(AssistantModel.phone_number == assistant.phone_number).first()
    if existing_assistant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Phone number already exists."
        )
    assistant = AssistantModel(**assistant.model_dump())
    db.add(assistant)
    db.commit()
    db.refresh(assistant)
    return assistant