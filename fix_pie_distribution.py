import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Fix first Pie chart
content = content.replace(
    "const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0));",
    "const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).map(c => ({...c, equalSlice: 1}));"
)
content = content.replace('dataKey="avg"', 'dataKey="equalSlice"')

# Fix second Pie chart
content = content.replace(
    "const sorted = [...centreBoard].sort((a,b) => (b.qualRate||0)-(a.qualRate||0));",
    "const sorted = [...centreBoard].sort((a,b) => (b.qualRate||0)-(a.qualRate||0)).map(c => ({...c, equalSlice: 1}));"
)
content = content.replace('dataKey="qualRate"', 'dataKey="equalSlice"')

with open(file_path, 'w') as f:
    f.write(content)

