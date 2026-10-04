from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    amount = Column(Float)

    mpesa_receipt = Column(String)

    checkout_request_id = Column(String)

    status = Column(String)

    created_at = Column(DateTime(timezone=True), server_default=func.now())