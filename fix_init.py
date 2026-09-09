import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

old_init = "let d = { name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"

new_init = "let d = { name: label, total: s.marks ?? s.score };\n                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(s => { d[`${s}_pos`] = 0; d[`${s}_neg`] = 0; d[`${s}_val`] = 0; });"

content = content.replace(old_init, new_init)

with open(file_path, 'w') as f:
    f.write(content)

