import os
import base64
import requests
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")
MPESA_ENV = os.getenv("MPESA_ENV")

SHORTCODE = os.getenv("MPESA_SHORTCODE")
PASSKEY = os.getenv("MPESA_PASSKEY")
CALLBACK_URL = os.getenv("MPESA_CALLBACK_URL")


def get_access_token():

    if MPESA_ENV == "sandbox":
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    else:
        url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    credentials = f"{CONSUMER_KEY}:{CONSUMER_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {encoded_credentials}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to get access token: {response.text}")

    return response.json()["access_token"]


def stk_push(phone, amount):

    print("Phone before formatting:", phone)

    # Convert 0712345678 -> 254712345678
    if phone.startswith("0"):
        phone = "254" + phone[1:]

    # Convert +254712345678 -> 254712345678
    if phone.startswith("+254"):
        phone = phone.replace("+", "")

    print("Phone after formatting:", phone)    

    access_token = get_access_token()

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    password = base64.b64encode(
        f"{SHORTCODE}{PASSKEY}{timestamp}".encode()
    ).decode()
    print("STK Shortcode:", SHORTCODE)
    print("STK Timestamp:", timestamp)
    print("STK Password Length:",len(password))

    if MPESA_ENV == "sandbox":
        url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    else:
        url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "Loan App",
        "TransactionDesc": "Loan repayment"
    }

    response =  requests.post(
        url,
        json=payload,
        headers=headers
    )

    print("M-Pesa HTTP Status:", response.status_code)
    print("P-Pesa Response:", response.text)

    try: 
        return response.json()
    except ValueError:
        return {
            "error": "M-Pesa returned a non-JSON response",
            "status_code": response.status_code,
            "response": response.text
        }
