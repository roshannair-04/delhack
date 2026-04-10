from pydantic import BaseModel

class VisitorCreateRequest(BaseModel):
    name: str
    phone: str