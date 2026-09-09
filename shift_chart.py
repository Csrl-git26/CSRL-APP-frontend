import re
import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace the cx property in RadialBarChart
old_chart = """<RadialBarChart 
                    cx="50%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >"""

new_chart = """<RadialBarChart 
                    cx="40%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >"""

if old_chart in content:
    content = content.replace(old_chart, new_chart)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Success: Chart shifted left.")
else:
    print("Error: Could not find exact string match.")
