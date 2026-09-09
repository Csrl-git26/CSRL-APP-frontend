import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/Layout.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove Rankings from ADMIN_NAV
content = content.replace("  { key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           },\n", "")

with open(file_path, 'w') as f:
    f.write(content)

