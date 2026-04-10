import asyncio
import os
import cv2
from uuid import uuid4
from sqlalchemy import text

# Assuming paths map out safely since we're invoking from root
from app.services.face_service import get_face_embedding
from app.db.session import AsyncSessionLocal

async def seed_users():
    seed_folder = "enrollments"
    if not os.path.exists(seed_folder):
        os.makedirs(seed_folder)
        print(f"Created '{seed_folder}' directory. Please drop .jpg files of faces here, named like 'John Doe.jpg' and run again.")
        return

    images = [f for f in os.listdir(seed_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if not images:
        print(f"No images found in '{seed_folder}'. Drop some images there!")
        return

    async with AsyncSessionLocal() as db:
        for image_file in images:
            name = os.path.splitext(image_file)[0]
            path = os.path.join(seed_folder, image_file)
            
            image = cv2.imread(path)
            if image is None:
                print(f"Could not read {path}")
                continue
                
            result = get_face_embedding(image)
            if result is None:
                print(f"No face detected in {image_file}")
                continue
                
            embedding_arr = result["embedding"]
            embedding_list = embedding_arr.tolist() if hasattr(embedding_arr, "tolist") else embedding_arr

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
            print(f"Successfully enrolled: {name}")

        await db.commit()
        print("Database seeding completed.")

if __name__ == "__main__":
    asyncio.run(seed_users())
