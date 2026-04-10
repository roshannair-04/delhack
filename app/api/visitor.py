from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from datetime import datetime, timedelta
import qrcode
import base64
from io import BytesIO
import numpy as np
import cv2
from sqlalchemy import text

from app.db.session import get_db
from app.services.face_service import get_face_embedding

router = APIRouter()


@router.post("/visitor/create")
async def create_visitor(
    name: str,
    phone: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    visitor_id = str(uuid4())
    valid_from = datetime.utcnow()
    valid_to = valid_from + timedelta(hours=2)

    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    result = get_face_embedding(image)

    if not result:
        return {"error": "No face detected"}

    embedding = result["embedding"]
    embedding_list = embedding.tolist() if hasattr(embedding, "tolist") else embedding

    qr_payload = f"VISITOR:{visitor_id}"

    qr = qrcode.make(qr_payload)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    try:
        await db.execute(
            text("""
            INSERT INTO visitor.visitors
            (id, name, phone, embedding, qr_code, valid_from, valid_to)
            VALUES (:id, :name, :phone, CAST(:embedding AS vector), :qr, :vf, :vt)
            """),
            {
                "id": visitor_id,
                "name": name,
                "phone": phone,
                "embedding": str(embedding_list),
                "qr": qr_payload,
                "vf": valid_from,
                "vt": valid_to,
            },
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        print("DB Error visitor:", e)
        return {"error": f"Database error: {str(e)}"}

    return {
        "visitor_id": visitor_id,
        "qr_code": qr_base64,
        "valid_till": valid_to
    }

@router.post("/visitor/checkout/{qr_code}")
async def checkout(qr_code: str, db: AsyncSession = Depends(get_db)):
    await db.execute(text("""
        UPDATE visitor.visitors
        SET checked_out = TRUE
        WHERE qr_code = :qr
    """), {"qr": qr_code})

    await db.commit()

    return {"message": "Visitor checked out"}

@router.get("/visitor/validate/{qr_code}")
async def validate(qr_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("""
        SELECT name, valid_from, valid_to, checked_out
        FROM visitor.visitors
        WHERE qr_code = :qr
    """), {"qr": qr_code})

    row = result.first()

    if not row:
        return {"status": "INVALID"}

    now = datetime.utcnow()

    if row.valid_to < now or row.checked_out:
        return {"status": "EXPIRED"}

    return {
        "status": "VALID",
        "name": row.name
    }

@router.get("/stats")
async def stats(db: AsyncSession = Depends(get_db)):
    total_r = await db.execute(text("SELECT COUNT(*) FROM visitor.visitors"))
    total = total_r.scalar() or 0

    active_r = await db.execute(text("""
        SELECT COUNT(*) FROM visitor.visitors
        WHERE checked_out = FALSE AND valid_to > NOW()
    """))
    active_on_campus = active_r.scalar() or 0

    today_r = await db.execute(text("""
        SELECT COUNT(*) FROM visitor.visitors
        WHERE created_at::date = CURRENT_DATE
    """))
    entries_today = today_r.scalar() or 0

    return {
        "visitors": total,
        "total_visitors": total,
        "active_on_campus": active_on_campus,
        "entries_today": entries_today,
    }
