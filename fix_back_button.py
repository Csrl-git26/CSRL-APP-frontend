import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/AdminDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Add back button condition for 'ranking'
content = content.replace(
    "{activePage === 'centre-overview' ? (",
    "{['centre-overview', 'ranking'].includes(activePage) ? ("
)

# 2. Update onTotalStudentsClick to set previous page
old_click = "onTotalStudentsClick={() => setActivePage('ranking')}"
new_click = "onTotalStudentsClick={() => { setPreviousPage(activePage); setActivePage('ranking'); }}"
content = content.replace(old_click, new_click)

with open(file_path, 'w') as f:
    f.write(content)

