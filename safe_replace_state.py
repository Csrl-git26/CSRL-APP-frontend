import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

target1 = "  const [activeAvgIndex, setActiveAvgIndex] = useState(-1);\n"
target2 = "  const [activeQualIndex, setActiveQualIndex] = useState(-1);\n"

if target1 in content:
    content = content.replace(target1, "")
if target2 in content:
    content = content.replace(target2, "")

with open(file_path, 'w') as f:
    f.write(content)

