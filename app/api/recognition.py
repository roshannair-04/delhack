from fastapi import APIRouter, UploadFile, File, Depends
import numpy as np
import cv2
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.face_service import get_face_embedding
from app.services.decision_engine import classify_face
from app.db.session import get_db

from pydantic import BaseModel
import requests

router = APIRouter()

class EmbedReq(BaseModel):
    embedding: list

@router.post("/recognize_embedding")
async def recognize_embedding_endpoint(
    req: EmbedReq,
    db: AsyncSession = Depends(get_db)
):
    embedding_arr = np.array(req.embedding)
    decision = await classify_face(embedding_arr, db)
    
    # default bbox placeholder
    decision["bbox"] = [0, 0, 100, 100]

    try:
        requests.post("http://localhost:4000/alert", json=decision, timeout=1)
    except:
        pass

    try:
        from app.services.email_service import send_email_alert
        from app.services.mobile_alert_service import send_push_notification
        
        send_email_alert(
            decision["status"],
            decision.get("identity"),
            decision.get("confidence", 0.0)
        )
        send_push_notification(
            decision["status"],
            decision.get("identity"),
            decision.get("confidence", 0.0)
        )
    except Exception as e:
        print(f"Failed to dispatch alerts: {e}")
    
    return decision


@router.post("/recognize")
async def recognize_face(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()

    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    result = get_face_embedding(image)

    if not result:
        return {"status": "no_face_detected"}

    embedding = result["embedding"]
    bbox = result["bbox"]

    decision = await classify_face(embedding, db)

    # 🔥 attach bbox
    decision["bbox"] = bbox

    # push to realtime dashboard
    import requests
    try:
        requests.post("http://localhost:4000/alert", json=decision, timeout=1)
    except:
        pass

    try:
        from app.services.email_service import send_email_alert
        from app.services.mobile_alert_service import send_push_notification
        
        send_email_alert(
            decision["status"],
            decision.get("identity"),
            decision.get("confidence", 0.0)
        )
        send_push_notification(
            decision["status"],
            decision.get("identity"),
            decision.get("confidence", 0.0)
        )
    except Exception as e:
        print(f"Legacy Dispatch Error: {e}")
    
    return decision