from fastapi import APIRouter
from pydantic import BaseModel
from app.services.mobile_alert_service import register_push_token

router = APIRouter()

class TokenRequest(BaseModel):
    token: str

@router.post("/register-token")
async def register_device_token(req: TokenRequest):
    register_push_token(req.token)
    return {"message": "Token registered successfully"}
