from pydantic import BaseModel


class LoanCreate(BaseModel):
    amount: int
    purpose: str


class LoanResponse(BaseModel):
    id: int
    user_id: int
    amount: int
    purpose: str
    status: str
    amount_repaid: int
    balance: int

    class Config:
        from_attributes = True

class LoanListResponse(BaseModel):
    id: int
    amount: int
    purpose: str
    status: str
    amount_repaid: int
    balance: int

    class Config:
        from_attributes = True        