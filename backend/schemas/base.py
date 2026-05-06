from typing import TypeVar, Generic, Optional
from pydantic import BaseModel

T = TypeVar("T")


class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    pages: int


class DetailResponse(BaseModel, Generic[T]):
    data: T
