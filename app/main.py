from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from uuid import uuid4
import cv2
import numpy as np

from app.db.session import get_db
from app.services.face_service import get_face_embedding
from app.api.visitor import router as visitor_router
from app.api.recognition import router as recognition_router
from app.api.alerts import router as alerts_router

app = FastAPI(title="UWSD API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(visitor_router, prefix="/api")
app.include_router(recognition_router, prefix="/api")
app.include_router(alerts_router, prefix="/api/alerts")

@app.post("/user/create")
async def create_user(
    name: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        return {"error": "File must be an image"}

    contents = await file.read()

    np_img = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    if image is None:
        return {"error": "Invalid image"}

    result = get_face_embedding(image)

    if result is None:
        return {"error": "No face detected"}

    embedding = result["embedding"]
    embedding_list = embedding.tolist() if hasattr(embedding, "tolist") else embedding

    try:
        await db.execute(
            text("""
            INSERT INTO public.users (id, name, embedding)
            VALUES (:id, :name, CAST(:embedding AS vector))
            """),
            {
                "id": str(uuid4()),
                "name": name,
                "embedding": str(embedding_list)
            }
        )
        await db.commit()
        return {"message": "User added"}
    except Exception as e:
        await db.rollback()
        print("DB Error:", e)
        return {"error": f"Database error: {str(e)}"}