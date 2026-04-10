import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_email_alert(status, identity, confidence):
    if status != "RED":
        return

    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")

    if not sender_email or not sender_password:
        print("Email alert omitted: SMTP credentials not set in environment.")
        return

    subject = "🚨 UWSD SECURITY ALERT: Intrusion Detected"
    body = f"""
    <h2>Security Alert</h2>
    <p>An unknown person or threat has been detected at the monitored zone.</p>
    <ul>
        <li><b>Identity:</b> {identity}</li>
        <li><b>Confidence:</b> {round(confidence, 2)}</li>
    </ul>
    <p>Please review the real-time dashboard or camera feed immediately.</p>
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = sender_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
            print("Alert email sent successfully.")
    except Exception as e:
        print("Email error:", e)
