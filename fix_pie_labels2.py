import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix the label function parameters and output
content = content.replace('label={({ cx, cy, midAngle, outerRadius, name, index }) => {', 'label={({ cx, cy, midAngle, outerRadius, payload, index }) => {')
content = content.replace('{name}', '{payload?.code || ""}')

with open(file_path, 'w') as f:
    f.write(content)

