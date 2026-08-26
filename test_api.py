import urllib.request
import json
import sys

token = open('../CSRL-APP-backed/token.txt').read().strip()
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
