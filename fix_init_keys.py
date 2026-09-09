import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_d = "let d = { name: label, total: s.marks ?? s.score };"
new_d = "let d = { name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"

content = content.replace(old_d, new_d)

with open(file_path, 'w') as f:
    f.write(content)

