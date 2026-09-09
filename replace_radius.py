import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('const radius = outerRadius + 18;', 'const radius = outerRadius + 8;')

with open(file_path, 'w') as f:
    f.write(content)

