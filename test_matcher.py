import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as session:
        # Get one valid embedding directly from DB to test with
        res = await session.execute(text("SELECT id, embedding FROM visitor.visitors LIMIT 1"))
        row = res.first()
        if not row:
            print("No visitors")
            return
            
        vid = row[0]
        # It's returned as a vector string by pgvector since we didn't decode it, or as a list if pgvector decodes it
        print("Raw type from db:", type(row[1]))
        emb = row[1]
        if isinstance(emb, str):
            # Parse list from string
            import json
            emb = json.loads(emb)

        # Call the logic directly
        query = text("""
            SELECT id, name,
                   1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM visitor.visitors
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT 1;
        """)
        match_result = await session.execute(query, {"embedding": str(emb)})
        match_row = match_result.first()
        print("Best match:", match_row._mapping if match_row else None)

asyncio.run(main())
