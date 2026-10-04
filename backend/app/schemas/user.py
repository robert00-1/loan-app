from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str 

class UserLogin(BaseModel):
    email: EmailStr
    password: str
class ProfileUpdate(BaseModel):
    national_id: str
    gender: str
    marital_status: str
    county: str
    city: str
    address: str
    occupation: str
    employer: str
    monthly_income: int
    employment_status: str
    next_of_kin: str
    next_of_kin_phone: str
