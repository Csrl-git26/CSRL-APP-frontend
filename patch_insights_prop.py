import sys

filepath = 'src/components/InsightsDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

old_prop = "<SubjectTopCentres data={data} selectedTestKeys={selectedTestKey && selectedTestKey !== 'Multiple Tests' ? [selectedTestKey] : []} />"
new_prop = "<SubjectTopCentres centreBoard={centreBoard} />"

content = content.replace(old_prop, new_prop)

with open(filepath, 'w') as f:
    f.write(content)
