from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from datetime import datetime, timedelta

from app.database import Base


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    amount = Column(Integer, nullable=False)

    purpose = Column(String, nullable=False)

    status = Column(String, default="pending")

    amount_repaid = Column(Integer, default=0)

    balance = Column(Integer, nullable=False)

    penalty_added_months = Column(Integer, default=0)

    due_date = Column(
        DateTime,
        default=lambda: datetime.utcnow() + timedelta(days=30)
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    conversation_id = Column(String, nullable=True)

    originator_conversation_id = Column(String, nullable=True)

    disbursement_status = Column(
        String,
        default="pending"
    )