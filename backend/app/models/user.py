from sqlalchemy import Column, Integer, String, Boolean, Date
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True)
    hashed_password = Column(String, nullable=False)
    loan_limit = Column(Integer, default=2000)
    wallet_balance = Column(Integer, default=0)
    is_admin = Column(Boolean, default=False)

    credit_score = Column(Integer, default=50)
    total_loans_taken = Column(Integer, default=0)
    total_loans_repaid = Column(Integer, default=0)

    national_id = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    marital_status = Column(String, nullable=True)
    county = Column(String, nullable=True)
    city = Column(String, nullable=True)
    address = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    employer = Column(String, nullable=True)
    monthly_income = Column(Integer, nullable=True)
    employment_status = Column(String, nullable=True)
    next_of_kin = Column(String, nullable=True)
    next_of_kin_phone = Column(String, nullable=True)
    registration_fee_paid = Column(Boolean, default=False)
    registration_checkout_request_id = Column(String, nullable=True)

    