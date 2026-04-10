from dotenv import load_dotenv
load_dotenv()

from app.services.email_service import send_email_alert

print("Testing email service...")
# Calling it with "RED" status to trigger the email
send_email_alert("RED", "Test Intruder", 0.99)
print("Test complete.")
