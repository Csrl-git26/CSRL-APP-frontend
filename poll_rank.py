import urllib.request
import json
import time

url = 'https://csrl-app-backed-1.onrender.com/api/analytics/student-chart?rollKey=2601001'

for _ in range(40):
    try:
        response = urllib.request.urlopen(url)
        if response.status == 200:
            data = json.loads(response.read().decode('utf-8'))
            chart_data = data.get('chartData', [])
            fmt02 = next((r for r in chart_data if r['name'] == 'FMT02'), None)
            if fmt02 and 'Total_Rank' in fmt02:
                print("DEPLOYED!")
                print(json.dumps(fmt02, indent=2))
                break
            else:
                print(f"Still returning without rank", end="\r")
    except Exception as e:
        print(f"Error: {e}", end="\r")
    time.sleep(5)
