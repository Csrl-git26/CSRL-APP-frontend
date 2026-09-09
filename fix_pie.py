import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix the 'avg' property in the newly added block
start_marker = "{/* Fourth Column: Qual Pie Chart */}"
start_idx = content.find(start_marker)

if start_idx != -1:
    new_block = content[start_idx:]
    new_block = new_block.replace("sorted[index]?.avg || 0", "sorted[index]?.qualRate || 0")
    content = content[:start_idx] + new_block

with open(file_path, 'w') as f:
    f.write(content)

