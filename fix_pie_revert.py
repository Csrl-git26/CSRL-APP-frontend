import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Revert RankRow
content = content.replace('{payload?.code || ""}', '{name}', 1) # Only the first occurrence in RankRow

# For the Bar chart YAxis tick:
# <text x={-5} y={-4} textAnchor="end" fill="#64748b" fontSize={9} fontWeight={700}>{payload?.code || ""} {extra}</text>
content = content.replace('{payload?.code || ""} {extra}', '{name} {extra}')

with open(file_path, 'w') as f:
    f.write(content)

