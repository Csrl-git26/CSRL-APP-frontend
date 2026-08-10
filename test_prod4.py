import urllib.request
import urllib.parse
import json

url = "https://csrl-app-backed.onrender.com/api/auth/login"
data = json.dumps({"role": "student", "id": "2601001"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        token = res.get('token')
        
        chart_url = "https://csrl-app-backed.onrender.com/api/analytics/student-chart?rollKey=2601001&centerCode=KNP"
        chart_req = urllib.request.Request(chart_url, headers={'Authorization': 'Bearer ' + token})
        try:
            with urllib.request.urlopen(chart_req) as chart_res:
                chart_data = json.loads(chart_res.read().decode())
                fmt04 = next((x for x in chart_data.get('chartData', []) if x.get('name') == 'FMT04'), None)
                print("STUDENT-CHART FMT04:", json.dumps(fmt04))
        except Exception as e:
            print("Chart Error:", e)
            if hasattr(e, 'read'):
                print(e.read().decode())
except Exception as e:
    print("Login Error:", e)
    if hasattr(e, 'read'):
        print(e.read().decode())
