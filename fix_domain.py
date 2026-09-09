import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("domain={[0, 'dataMax + 20']}", "domain={[0, 'auto']}")

with open(file_path, 'w') as f:
    f.write(content)

