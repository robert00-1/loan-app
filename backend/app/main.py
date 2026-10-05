from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, ProfileUpdate

from app.auth import create_access_token
from app.security import hash_password, verify_password
from app.auth import get_current_user
from fastapi.security import OAuth2PasswordBearer
from app.models.loan import Loan
from app.schemas.loan import LoanCreate, LoanResponse, LoanListResponse
from app.models.repayment import Repayment
from app.models.visitor import Visitor
from app.schemas.repayment import RepaymentCreate, RepaymentResponse
from datetime import datetime, timedelta
import math
from app.models.installment import Installment
from fastapi import Request
from app.services.mpesa import stk_push
from app.services.b2c import b2c_payment
from fastapi.middleware.cors import CORSMiddleware
from app.services.loan_engine import evaluate_loan
from app.services.interest import calculate_interest

class VisitorTrack(BaseModel):
    visitor_id: str
    page: str

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
         "https://loan-app-zeta-bice.vercel.app",
    
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Loan API running"}


@app.post("/register")
def register(user: UserCreate,  request: Request, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)

    new_user = User(
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed_pw,
        loan_limit=2000,
        credit_score=50
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    visitor_id = request.headers.get("X-Visitor-ID")

    if visitor_id:
        visitor = db.query(Visitor).filter(
            Visitor.visitor_id == visitor_id
        ).first()

        if visitor_id:
            visitor.registered = True
            visitor.last_seen = datetime.utcnow()
            visitor.last_page = "/register"

            db.commit()

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )
        

    token = create_access_token({"user_id": db_user.id})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.get("/me")
def get_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    return {
        "id": db_user.id,
        "full_name": db_user.full_name,
        "email": db_user.email,
        "phone": db_user.phone,
        "is_admin": db_user.is_admin,
        "registration_fee_paid": db_user.registration_fee_paid,
        "loan_limit": db_user.loan_limit,
        "wallet_balance": db_user.wallet_balance,
        "credit_score": db_user.credit_score,
        "total_loans_taken": db_user.total_loans_taken,
        "total_loans_repaid": db_user.total_loans_repaid,

    }
@app.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
   db_user = db.query(User).filter(
       User.id == current_user["user_id"]
   ).first()
   db_user.national_id = profile.national_id
   db_user.gender = profile.gender
   db_user.marital_status = profile.marital_status
   db_user.county = profile.county
   db_user.city = profile.city
   db_user.address = profile.address
   db_user.occupation = profile.occupation
   db_user.employer = profile.employer
   db_user.monthly_income = profile.monthly_income
   db_user.employment_status = profile.employment_status
   db_user.next_of_kin = profile.next_of_kin
   db_user.next_of_kin_phone = profile.next_of_kin_phone
   

   db.commit()
   return {"message": "Profile updated successfully"}


@app.post("/loans", response_model=LoanResponse)
def apply_loan(
    loan: LoanCreate,
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()
    if not db_user.registration_fee_paid:
        raise HTTPException(
            status_code=400,
            detail="Please pay the KSh 150 registration fee first"
        )

    if db_user.credit_score < 40:
        raise HTTPException(
            status_code=400,
            detail="Your credit score is too low."
        )
        
    if loan.amount > db_user.loan_limit:
        raise HTTPException(
            status_code=400,
            detail="Requested amount exceeds your loan limit."
        )
    active_loan = db.query(Loan).filter(
        Loan.user_id == db_user.id,
        Loan.status == "approved",
        Loan.balance > 0
    ).first()

    if active_loan:
        raise HTTPException(
           status_code=400,
           detail="You already have an unpaid loan." 
        )
    loan_status ="pending"
    
    new_loan = Loan(
        user_id=current_user["user_id"],
        amount=loan.amount,
        purpose=loan.purpose,
        status=loan_status,
        amount_repaid=0,
        balance=loan.amount,
        due_date=datetime.utcnow() + timedelta(days=30)
    )

    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)

    visitor_id = request.headers.get("X-Visitor-ID")

    if visitor_id:
        visitor = db.query(Visitor).filter(
            Visitor.visitor_id == visitor_id
        ).first()

        if visitor:
            visitor.applied_for_loan = True
            visitor.last_seen = datetime.utcnow()
            visitor.last_page = "/apply-loan"

            db.commit()

    

    return new_loan

@app.get("/loans", response_model=list[LoanListResponse])
def get_my_loans(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loans = db.query(Loan).filter(
        Loan.user_id == current_user["user_id"]
    ).all()

    return loans
@app.get("/loans/{loan_id}/installments")
def get_installments(
    loan_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check the loan belongs to the logged-in user
    loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.user_id == current_user["user_id"]
    ).first()

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    installments = db.query(Installment).filter(
        Installment.loan_id == loan_id
    ).order_by(
        Installment.installment_number
    ).all()

    return installments

@app.get("/admin/loans")
def get_all_loans(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
     db_user = db.query(User).filter(
         User.id == current_user["user_id"]
     ).first()

     if not db_user.is_admin:
         raise HTTPException(
             status_code=403,
             detail="Admin access required"
         )
         
     
     loans = db.query(Loan).all()

     return loans
@app.put("/admin/loans/{loan_id}/approve")
def approve_loan(
    loan_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not db_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
        
    
    loan = db.query(Loan).filter(
        Loan.id == loan_id
    ).first()



    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )
        
    if loan.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Loan already approved"
        )
        
    
    loan.status = "approved"

    loan_info = calculate_interest(loan.amount)

    intrest = loan_info["interest"]
    total_repayment = loan_info["total"]

    loan.balance = total_repayment

    user = db.query(User).filter(
    User.id == loan.user_id
    ).first()

    print("========== APPROVE LOAN ==========")
    print("Loan ID:", loan.id)
    print("User:", user.full_name)
    print("Wallet BEFORE:", user.wallet_balance)

    user.loan_limit += loan.amount
    user.total_loans_taken += 1
    user.wallet_balance += loan.amount

    print("Loan Amount:", loan.amount)
    print("Wallet AFTER:", user.wallet_balance)

    months = math.ceil(loan.amount / 2500) 
    
    remaining_amount = total_repayment

    for i in range(months):

        if remaining_amount >= 2500:
            amount = 2500

        else:
            amount = remaining_amount

        installment   = Installment(
            loan_id=loan.id,
            installment_number=i + 1,
            amount=amount,
            due_date=datetime.utcnow() + timedelta(days=30 * (i + 1)),
            is_paid=False,
            late_fee=0
        )

        db.add(installment)

        remaining_amount -= amount     

    phone = user.phone

    if not phone:
        raise HTTPException(
            status_code=400,
            detail="User does not have a phone"
        )

    if phone.startswith("0"):
        phone = "254" + phone[1:]
    elif phone.startswith("+254"):
        phone = phone[1:]

    print("Phone from database:", user.phone)
    print("Phone sent to M-PESA:", phone)    

    response = b2c_payment(
        phone,
        loan.amount
    )

    print(response)

    if response.get("ResponseCode") == "0":
        loan.conversation_id = response.get("ConversationID")
        loan.originator_conversation_id = response.get("OriginatorConversationID")
        loan.disbursement_status = "processing"
    else:
        loan.disbursement_status = "failed"

    db.commit()

    db.refresh(user)
    print("Wallet AFTER COMMIT:", user.wallet_balance)
    print("=================================")


    return {
        "message": "Loan approved",
        "borrowed": loan.amount,
        "intrest": intrest,
        "total_to_repay": total_repayment,
        "loan_id": loan.id,
        "status": loan.status,
        "disbursement": response
    }
   
@app.put("/admin/loans/{loan_id}/reject")
def reject_loan(
    loan_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not db_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
        
    
    loan = db.query(Loan).filter(
        Loan.id == loan_id
    ).first()

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )
        
    
    if loan.status == "approved":
        raise HTTPException(
            status_code=400,
            detail="Approved loans cannot be rejected"
        )
        
    
    if loan.status == "rejected":
        raise HTTPException(
            status_code=400,
            detail="Loan already rejected"
        )
        
    
    loan.status = "rejected"

    db.commit()

    return {
        "message": "Loan rejected",
        "loan_id": loan_id,
        "status": loan.status
    }
@app.get("/admin/stats")
def admin_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not db_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
        

    total_users = db.query(User).count()

    total_loans = db.query(Loan).count()

    approved_loans = db.query(Loan).filter(
        Loan.status == "approved"
    ).count()

    rejected_loans = db.query(Loan).filter(
        Loan.status == "rejected"
    ).count()

    pending_loans = db.query(Loan).filter(
        Loan.status == "pending"
    ).count()

    return {
        "total_users": total_users,
        "total_loans": total_loans,
        "approved_loans": approved_loans,
        "rejected_loans": rejected_loans,
        "pending_loans": pending_loans
    }

 
@app.post("/installments/{installment_id}/pay")
def pay_installment(
    installment_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find installment
    installment = db.query(Installment).filter(
        Installment.id == installment_id
    ).first()

    if not installment:
        raise HTTPException(
            status_code=404,
            detail="Installment not found"
        )

    # Prevent paying twice
    if installment.is_paid:
        raise HTTPException(
            status_code=400,
            detail="Installment already paid"
        )

    # Find the loan
    loan = db.query(Loan).filter(
        Loan.id == installment.loan_id,
        Loan.user_id == current_user["user_id"]
    ).first()

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )

    if loan.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Only approved loans can be repaid"
        )

    # Apply late fee
    if datetime.utcnow() > installment.due_date:

        if installment.late_fee == 0:
            installment.late_fee = 500
            loan.balance += 500

            user = db.query(User).filter(
                User.id == loan.user_id
            ).first()

            user.credit_score = max(
                user.credit_score - 5,
                0
            )

    user = db.query(User).filter(
        User.id == loan.user_id
    ).first()


    total_amount = installment.amount + installment.late_fee


    if user.wallet_balance < total_amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient wallet balance"
        )
    
    user.wallet_balance -= total_amount
   
    # Save repayment
    new_repayment = Repayment(
        loan_id=loan.id,
        amount=installment.amount
    )

    db.add(new_repayment)

    # Mark installment as paid
    installment.is_paid = True
    installment.paid_at = datetime.utcnow()

    # Update loan totals
    loan.amount_repaid += installment.amount
    loan.balance -= installment.amount

    # Complete loan if fully paid
    if loan.balance <= 0:
        loan.balance = 0
        loan.status = "completed"

        user = db.query(User).filter(
            User.id == loan.user_id
        ).first()

        user.credit_score = min(
            user.credit_score + 10,
            100
        )

        user.total_loans_repaid += 1

    db.commit()
    db.refresh(new_repayment)

    return {
        "message": "Installment paid successfully",
        "repayment": new_repayment
    }
@app.get("/loans/{loan_id}/repayments")
def get_repayments(
    loan_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.user_id == current_user["user_id"]
    ).first()

    if not loan:
        raise HTTPException(
            status_code=404,
            detail="Loan not found"
        )
        
    Repayments = db.query(Repayment).filter(
        Repayment.loan_id == loan_id
    ).all()

    return Repayments

 
@app.post("/mpesa/callback")
async def mpesa_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()

    print("========== M-PESA CALLBACK ==========")
    print(data)

    stk = data["Body"]["stkCallback"]

    checkout_request_id = stk["CheckoutRequestID"]
    result_code = stk["ResultCode"]
    result_desc = stk["ResultDesc"]

    # Registration fee payment

    user = db.query(User).filter(
        User.registration_checkout_request_id == checkout_request_id
    ).first()

    if user:

        if result_code == 0:
            user.registration_fee_paid = True
            user.registration_checkout_request_id = None

            db.commit()

            print("Registration fee paid successfully.")

        else:
            user.registration_fee_paid = False
            user.registration_checkout_request_id = None

            db.commit()
            print(
                f"Registration fee paid successfully:"
                 f"{result_code} - {result_desc}"
            )
        return {
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }
            


    installment = db.query(Installment).filter(
        Installment.checkout_request_id == checkout_request_id
    ).first()

    if not installment:
        return {
            "ResultCode": 0,
            "ResultDesc": "Installment not found"
        }

    # PAYMENT FAILED
    if result_code != 0:
        installment.payment_status = "failed"

        db.commit()

        print(f"Payment failed: {result_desc}")

        return {
            "ResultCode": 0,
            "ResultDesc": "Payment recorded as failed"
        }

    # PAYMENT SUCCESS
    installment.payment_status = "paid"
    installment.is_paid = True
    installment.paid_at = datetime.utcnow()

    loan = db.query(Loan).filter(
        Loan.id == installment.loan_id
    ).first()

    loan.amount_repaid += installment.amount
    loan.balance -= installment.amount

    repayment = Repayment(
        loan_id=loan.id,
        amount=installment.amount
    )
    db.add(repayment)

    user = db.query(User).filter(
        User.id == loan.user_id
    ).first()

    if loan.balance <= 0:
        loan.balance = 0
        loan.status = "completed"

        user.credit_score = min(user.credit_score + 10, 100)
        user.loan_limit += 5000
        user.total_loans_repaid += 1

    db.commit()

    print("Payment completed successfully.")

    return {
        "ResultCode": 0,
        "ResultDesc": "Accepted"

    }
@app.post("/mpesa/b2c/result")
async def b2c_result(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()

    print("========== B2C RESULT ==========")
    print(data)

    result = data["Result"]

    originator = str(result["OriginatorConversationID"])
    result_code = result["ResultCode"]
    result_desc = result["ResultDesc"]

    loan = db.query(Loan).filter(
        Loan.originator_conversation_id == originator
    ).first()

    if loan:

        if result_code == 0:
            loan.disbursement_status = "completed"

        else:
            loan.disbursement_status = "failed"

        print(f"Loan {loan.id} -> {loan.disbursement_status}")
        print(f"Reason: {result_desc}")    

        db.commit()

    return {
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    }
@app.post("/mpesa/b2c/timeout")
async def b2c_timeout(
    request: Request,
    db: Session = Depends(get_db)
):
    data = await request.json()

    print("========== B2C TIMEOUT ==========")
    print(data)

    originator = data.get("OriginatorConversationID")

    loan = db.query(Loan).filter(
        Loan.originator_conversation_id == originator
    ).first()

    if loan:
        loan.disbursement_status = "timeout"
        db.commit()

    return {
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    }
      
    
@app.post("/installments/{installment_id}/stk")
def pay_installment_with_mpesa(
    installment_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    installment = db.query(Installment).filter(
        Installment.id == installment_id
    ).first()

    if not installment:
        raise HTTPException(
            status_code=404,
            detail="Installment not found"
        )
    if installment.is_paid:
        raise HTTPException(
            status_code=400,
            detail="Installment already paid"
        )

    
    loan = db.query(Loan).filter(
        Loan.id == installment.loan_id,
        Loan.user_id == current_user["user_id"]
    ).first()
    if not loan:
        raise HTTPException(
            status_code=404,
            detail="loan not found"
        )
    user = db.query(User).filter(
        User.id ==loan.user_id
    ).first()

    phone = user.phone

    if phone.startswith("0"):
        phone = "254" + phone[1:]

    print("Phone from database:", user.phone)
    print("Phone sent to M-PESA:", phone)    


    response = stk_push(
       phone,
       installment.amount
    

   )
    print(response)

    if response.get("ResponseCode") != "0":
        raise HTTPException(
            status_code=400,
            detail=response
        )
    installment.checkout_request_id = response["CheckoutRequestID"]
    installment.merchant_request_id = response["MerchantRequestID"]
    installment.payment_status = "processing"

    db.commit()

    return {
        "message": "STK Push sent",
        "response": response
    }
@app.put("/test-wallet/{user_id}")
def test_wallet(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.wallet_balance += 1000

    db.commit()
    db.refresh(user)

    return {
        "wallet_balance": user.wallet_balance
    }
@app.post("/registration-fee/pay")
def pay_registration_fee(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print("=== REGISTRATION FEE ENDPOINT HIT ===")

    user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if user.registration_fee_paid:
        raise HTTPException(
            status_code=400,
            detail="Registration fee already paid"
        )
    
    if not user.phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number not found"
        )

    print("USER:", user.full_name)
    print("PHONE:", user.phone)

    response = stk_push(user.phone, 1)

    print("STK RESPONSE:", response)

    if response.get("ResponseCode") != "0":
        raise HTTPException(
            status_code=400,
            detail=response
        )
    user.registration_checkout_request_id = response.get(
        "CheckoutRequestID"
    )
    db.commit()

    return {
        "message": "Registration fee STK sent",
        "checkout_request_id": response.get(
            "CheckoutRequestID"
        ),
        "response": response
    }

@app.get("/registration-fee/status")
def registration_fee_status(
    current_user=Depends(get_current_user),
    db:Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return {
        "registration_fee_paid": user.registration_fee_paid
    }

@app.post("/visitors/track")
def track_visitor(
    data: VisitorTrack,
    db: Session = Depends(get_db)
): 
    

    visitor = db.query(Visitor).filter(
        Visitor.visitor_id == data.visitor_id
    ).first()

    if visitor:
        visitor.last_seen = datetime.utcnow()
        visitor.last_page = data.page

    else:
        visitor = Visitor(
            visitor_id=data.visitor_id,
            last_page=data.page,
            registered=False,
            applied_for_loan=False
        )

        db.add(visitor)

    db.commit()

    return {
        "message": "Visitor tracked"
    }

@app.get("/admin/visitors")
def get_visitors(
    current_user=Depends(get_current_user),
    db:Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    if not db_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    visitors = db.query(Visitor).order_by(
        Visitor.last_seen.desc()
    ).all()

    return [
        {
            "id": visitor.id,
            "visitor_id": visitor.visitor_id,
            "first_seen": visitor.first_seen,
            "last_seen": visitor.last_seen,
            "last_page": visitor.last_page,
            "registered": visitor.registered,
            "applied_for_loan": visitor.applied_for_loan
        }
        for visitor in visitors
    ]

@app.get("/admin/visitor-stats")
def visitor_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(
        User.id == current_user["user_id"]
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not db_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # Count all visitors
    total_visitors = db.query(Visitor).count()

    # Count visitors who registered
    registered_visitors = db.query(Visitor).filter(
        Visitor.registered == True
    ).count()

    # Count visitors who applied for a loan
    loan_applicants = db.query(Visitor).filter(
        Visitor.applied_for_loan == True
    ).count()

    return {
        "total_visitors": total_visitors,
        "registered_visitors": registered_visitors,
        "loan_applicants": loan_applicants
    }




    
    
