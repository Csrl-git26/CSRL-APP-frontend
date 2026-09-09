import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace('onClick={(entry) => onViewCentre && onViewCentre(entry.code)}', 'onClick={(entry) => onViewCentre && onViewCentre(entry.code || entry.payload?.code)}')

with open(file_path, 'w') as f:
    f.write(content)

