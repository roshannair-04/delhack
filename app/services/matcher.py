from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def find_best_match(embedding, db: AsyncSession):

    query = """
    SELECT id, name,
           1 - (embedding <=> :embedding) AS similarity
    FROM visitor.visitors
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> :embedding
    LIMIT 1;
    """

    result = await db.execute(
        text("""
    SELECT id, name,
           1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
    FROM visitor.visitors
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> CAST(:embedding AS vector)
    LIMIT 1;
    """),
    {"embedding": str(embedding)}
    )
    row = result.first()
    print("Database matcher row:", row)
    return row._mapping if row else None