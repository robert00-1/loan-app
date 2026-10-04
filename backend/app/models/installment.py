from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean, String
from datetime import datetime
from app.database import Base



from app.database import Base


class Installment(Base):
    __tablename__ = "installments"

    id = Column(Integer, primary_key=True, index=True)

    loan_id = Column(Integer, ForeignKey("loans.id"))

    installment_number = Column(Integer, nullable=False)

    amount = Column(Integer, nullable=False)

    is_paid = Column(Boolean, default=False)

    paid_at = Column(DateTime, nullable=True)

    late_fee = Column(Integer, default=0)
    due_date = Column(DateTime, nullable=True)

    checkout_request_id = Column(String, nullable=True)
    merchant_request_id = Column(String, nullable=True)
    payment_status = Column(String, default="pending")

