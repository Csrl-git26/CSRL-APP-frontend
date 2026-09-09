import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace stackId="pos" and stackId="neg" with stackId="a"
content = content.replace('stackId="pos"', 'stackId="a"')
content = content.replace('stackId="neg"', 'stackId="a"')

with open(file_path, 'w') as f:
    f.write(content)

