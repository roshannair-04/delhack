from sqlalchemy import text

THRESHOLD = 0.3


async def find_match(table, embedding, db):
    result = await db.execute(
        text(f"""
        SELECT id, name,
               1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM {table}
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:embedding AS vector)
        LIMIT 1;
        """),
        {"embedding": str(embedding.tolist() if hasattr(embedding, "tolist") else embedding)}
    )

    row = result.first()
    return row._mapping if row else None


async def classify_face(embedding, db):

    # 🟢 GREEN — known users
    user = await find_match("public.users", embedding, db)
    if user and user["similarity"] > THRESHOLD:
        return {
            "status": "GREEN",
            "identity": user["name"],
            "confidence": float(user["similarity"])
        }

    # 🟡 YELLOW — visitors
    visitor = await find_match("visitor.visitors", embedding, db)
    if visitor and visitor["similarity"] > THRESHOLD:
        return {
            "status": "YELLOW",
            "identity": visitor["name"],
            "confidence": float(visitor["similarity"])
        }

    # 🔴 RED — unknown
    return {
        "status": "RED",
        "confidence": 0
    }