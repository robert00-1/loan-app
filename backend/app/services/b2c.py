import os 
import requests
import base64
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET")

B2C_SHORTCODE = os.getenv("B2C_SHORTCODE")
INITIATOR_NAME = os.getenv("INITIATOR_NAME")
SECURITY_CREDENTIAL = os.getenv("SECURITY_CREDENTIAL")

B2C_RESULT_URL = os.getenv("B2C_RESULT_URL")
B2C_TIMEOUT_URL = os.getenv("B2C_TIMEOUT_URL")


def get_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    auth = base64.b64encode(
        f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()
    ).decode()

    headers = {
        "Authorization": f"Basic {auth}"
    }

    response = requests.get(url, headers=headers)

    print("Status Code:", response.status_code)
    print("Response:", response.text)

    return response.json()["access_token"]

def b2c_payment(phone, amount,remarks="Loan Disbursement"):
    access_token = get_access_token()

    url = "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "OriginatorConversationID": datetime.now().strftime("%Y%m%d%H%M%S"),
        "InitiatorName": INITIATOR_NAME,
        "SecurityCredential": SECURITY_CREDENTIAL,
        "CommandID": "BusinessPayment",
        "Amount": amount,
        "PartyA": B2C_SHORTCODE,
        "PartyB": phone,
        "Remarks": remarks,
        "QueueTimeOutURL": B2C_TIMEOUT_URL,
        "ResultURL": B2C_RESULT_URL,
        "Occasion": "Loan"
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers
    )

    print("Status Code:", response.status_code)
    print("Response:", response.text)

    return response.json()