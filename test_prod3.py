import urllib.request
import json
url = "https://csrl-app-backed.onrender.com/api/auth/login"
data = json.dumps({"role": "student", "id": "2601001"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", json.loads(response.read().decode()))
except Exception as e:
    print("Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
