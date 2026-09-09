import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

start_marker = "{/* Right Column: Pie Chart */}"
end_marker = "{/* Subject Top 3 Centres */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

print(content[start_idx:end_idx])

