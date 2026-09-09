import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Find the second PieChart block which has activeQualIndex and replace it with InteractivePieChart
match = re.search(r'<PieChart>.*?activeIndex=\{activeQualIndex\}.*?</PieChart>', content, flags=re.DOTALL)
if match:
    content = content.replace(match.group(0), "<InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />")

with open(file_path, 'w') as f:
    f.write(content)

