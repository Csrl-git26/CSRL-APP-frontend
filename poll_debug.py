import urllib.request
import json
import time

url = 'https://csrl-app-backed-1.onrender.com/api/debug-state/2601001'

for _ in range(30):
    try:
        response = urllib.request.urlopen(url)
        data = json.loads(response.read().decode('utf-8'))
        if 'hasRaw' in data:
            print("DEPLOYED!")
            print(json.dumps(data, indent=2))
            break
        else:
            print("Still old...", end="\r")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(5)
