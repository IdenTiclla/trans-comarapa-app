from pydantic import ConfigDict
from schemas.person import PersonBase, PersonCreate, PersonUpdate, Person as PersonSchema


class AssistantBase(PersonBase):
    pass


class AssistantCreate(PersonCreate, AssistantBase):
    pass


class AssistantPatch(PersonUpdate):
    pass


class Assistant(PersonSchema, AssistantBase):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
