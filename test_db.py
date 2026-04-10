import asyncio
from sqlalchemy import text
from app.db.session import AsyncSessionLocal

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT id, name FROM visitor.visitors LIMIT 1"))
        row = res.first()
        print(row)
        if row:
            print(row._mapping)

asyncio.run(main())
