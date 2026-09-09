import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Change grid layout to 4 columns
old_grid = "gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr'"
new_grid = "gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr'"
content = content.replace(old_grid, new_grid)

# Find the start and end of the Pie Chart block
start_marker = "{/* Right Column: Pie Chart */}"
end_marker = "{/* Subject Top 3 Centres */}"
start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

original_pie = content[start_idx:end_idx]

# Create the new pie chart
new_pie = original_pie.replace("Right Column: Pie Chart", "Fourth Column: Qual Pie Chart")
new_pie = new_pie.replace("Centre Distribution - Total Average Score", "Centre Distribution - Total qualification %")

# Be careful replacing 'avg' with 'qualRate'
new_pie = new_pie.replace(".avg||0", ".qualRate||0")
new_pie = new_pie.replace("dataKey=\"avg\"", "dataKey=\"qualRate\"")
new_pie = new_pie.replace("data.avg || 0", "data.qualRate || 0")

# Insert the new pie chart after the original pie chart
new_content = content[:end_idx] + new_pie + content[end_idx:]

with open(file_path, 'w') as f:
    f.write(new_content)

