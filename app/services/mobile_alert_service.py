import requests

# In a real app we'd query these from PostgreSQL, 
# but for the hackathon we can store them in memory.
registered_device_tokens = set()

def register_push_token(token: str):
    registered_device_tokens.add(token)
    print(f"Registered new device token: {token}")

def send_push_notification(status, identity, confidence):
    if status != "RED":
        return
        
    if not registered_device_tokens:
        print("No mobile devices registered for push alerts.")
        return

    message = {
        "to": list(registered_device_tokens),
        "sound": "default",
        "title": "🚨 SECURITY ALERT",
        "body": f"Intrusion Detected: {identity or 'Unknown'} (Confidence: {round(confidence, 2)})",
        "data": { "status": status, "identity": identity }
    }

    try:
        response = requests.post(
            "https://exp.host/--/api/v2/push/send",
            json=message,
            headers={
                "Accept": "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
            },
            timeout=5
        )
        if response.status_code == 200:
            print("Successfully sent push notifications to mobile devices.")
        else:
            print(f"Error sending push notification: {response.status_code}", response.text)
    except Exception as e:
        print("Exception during push notification:", e)
