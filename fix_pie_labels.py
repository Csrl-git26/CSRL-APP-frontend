import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Make the activeShape slightly smaller zoom (outerRadius + 5 instead of 8)
content = content.replace('outerRadius={outerRadius + 8}', 'outerRadius={outerRadius + 5}')

# Push the labels further out so they are never overlapped (outerRadius + 14 instead of 8)
content = content.replace('const radius = outerRadius + 8;', 'const radius = outerRadius + 15;')

with open(file_path, 'w') as f:
    f.write(content)

