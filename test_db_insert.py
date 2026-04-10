import requests

# Creating a dummy 100x100 black image
from PIL import Image
import io

img = Image.new('RGB', (100, 100))
img_byte_arr = io.BytesIO()
img.save(img_byte_arr, format='JPEG')
img_bytes = img_byte_arr.getvalue()

url = "http://localhost:8000/user/create"
files = {'file': ('dummy.jpg', img_bytes, 'image/jpeg')}
data = {'name': 'Test User'}

print("Sending request...")
try:
    response = requests.post(url, files=files, data=data)
    print("Status:", response.status_code)
    print("Response:", response.text)
except Exception as e:
    print("Error:", e)
