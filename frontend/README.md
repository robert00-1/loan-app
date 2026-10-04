# RobertLend - Loan Management System

## Overview

RobertLend is a full-stack loan management system built with **FastAPI**, **React**, and **PostgreSQL**. It allows users to register, apply for loans, receive loan approvals, manage wallet balances, and repay loans through installments. The project was built to demonstrate modern backend development practices, authentication, database design, and financial workflows.

---

## Features

### User Features

* User registration and login
* JWT authentication
* View personal dashboard
* Apply for loans
* View loan history
* Wallet balance management
* Repay loans through installments
* Automatic credit score updates
* Loan limit tracking

### Admin Features

* Secure admin login
* View pending loan applications
* Approve loans
* Automatic loan disbursement to wallet
* Automatic installment generation
* View all users and loans

### Loan Management

* Interest calculation based on loan amount
* Automatic repayment schedule
* Loan completion tracking
* Late fee support
* Wallet deductions during repayment

### Payment Integration

* M-Pesa B2C integration for loan disbursement (Sandbox)
* Wallet simulation for repayments

---

## Technologies Used

### Backend

* Python
* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication
* Uvicorn

### Frontend

* React
* React Router
* Tailwind CSS
* Axios

### Tools

* Git
* GitHub
* Postman
* Ngrok
* M-Pesa Daraja API (Sandbox)

---

## Project Structure

Backend

* FastAPI REST API
* Authentication
* Loan Management
* Wallet Management
* Installments
* Repayments
* Admin Management

Frontend

* React Components
* Dashboard
* Loan Application
* Loan History
* Admin Dashboard
* Authentication Pages



## Installation

### Clone Repository


git clone https://github.com/robert00-1/robertlend.git
cd robertlend
```

### Backend


cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload


### Frontend


cd frontend

npm install

npm run dev



## Screenshots

/home/isaac/Screenshots/Screenshot from 2026-07-11 08-27-45.png



## Future Improvements

* Registration fee payment before loan application
* Email notifications
* SMS notifications
* Loan agreement PDF generation
* Automatic monthly repayments
* Financial reports and analytics
* Production M-Pesa integration
* Docker deployment

---

## Author

**Robert Rashid**

Bachelor of Science in Chemistry

Certificate in Software Engineering

Backend Developer | Python | FastAPI | React | PostgreSQL

GitHub: https://github.com/robert00-1

---

## License

This project was built for educational and portfolio purposes.
