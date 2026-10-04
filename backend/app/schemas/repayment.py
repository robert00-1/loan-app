from pydantic import BaseModel

class RepaymentCreate(BaseModel):
    amount: int

class RepaymentResponse(BaseModel): 
    id: int
    loan_id:int
    amount: int

    class Config:
        from_attributes = True 