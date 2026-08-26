import urllib.request
import json
# I cannot query the prod DB directly unless I have the connection string.
# But I can use my debug endpoint again! Let's check if the server is up.
req = urllib.request.Request('https://csrl-app-backed.onrender.com/api/health')
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(e)
