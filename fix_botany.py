import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_formatter_bo = "formatter={(v) => v > 0 ? `Bo${v}` : ''}"
new_formatter_bo = "formatter={(v) => v !== 0 ? `Bo${v}` : ''}"
content = content.replace(old_formatter_bo, new_formatter_bo)

with open(file_path, 'w') as f:
    f.write(content)

