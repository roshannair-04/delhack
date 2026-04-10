from sqlalchemy import Column, String, Boolean, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Visitor(Base):
    __tablename__ = "visitors"
    __table_args__ = {"schema": "visitor"}

    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String)
    phone = Column(String)
    qr_code = Column(String, unique=True)
    valid_from = Column(TIMESTAMP)
    valid_to = Column(TIMESTAMP)
    checked_in = Column(Boolean, default=False)
    checked_out = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=text("NOW()"))