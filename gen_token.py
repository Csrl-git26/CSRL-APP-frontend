import jwt
import time
import json
import urllib.request
import sys

secret = 'CSRL_SUPER_SECRET_KEY_2024'
payload = {
    'role': 'admin',
    'id': 'admin',
    'iat': int(time.time()),
    'exp': int(time.time()) + 3600
}
token = jwt.encode(payload, secret, algorithm='HS256')

req = urllib.request.Request(
    'https://csrl-app-backed-1.onrender.com/api/analytics/student-chart?rollKey=2601001',
    headers={'Authorization': f'Bearer {token}'}
)
try:
    response = urllib.request.urlopen(req)
    data = json.loads(response.read().decode('utf-8'))
    for row in data:
        if row.get('name') == 'FMT02':
            print(json.dumps(row, indent=2))
except Exception as e:
    print(e)
