from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime

from app.database import Base

class Visitor(Base):

    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)

    visitor_id = Column(String, unique=True, index=True, nullable=False)

    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)

    last_page = Column(String, nullable=True)

    registered = Column(Boolean, default=False)

    applied_for_loan = Column(Boolean, default=False)