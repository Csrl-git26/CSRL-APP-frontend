import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# The structure we want to match:
# 1. Target & Goals card end: `</div>\n      </div>`
# 2. Performance Trend card start: `        <div className="card">\n          <div className="section-title">📈 Performance Trend</div>`
# 3. Overall weak topics: `<StudentOverallWeakTopics studentId={profile.ROLL_KEY} />\n      </div>`

# First, extract the graph card
graph_pattern = re.compile(r'(<div className="card">\s*<div className="section-title">📈 Performance Trend</div>.*?</ResponsiveContainer>\n\s*</div>\n\s*</div>)', re.DOTALL)
graph_match = graph_pattern.search(content)
if not graph_match:
    print("Graph card not found")
    exit(1)

graph_html = graph_match.group(1)

# Remove the graph card from its current position
content = content[:graph_match.start()] + content[graph_match.end():]

# Now, we need to find where to insert it. "just above complet tets record table"
# Find `      {/* Full Test Records */}`
insert_pattern = re.compile(r'(\s*\{\/\* Full Test Records \*\/\})')
insert_match = insert_pattern.search(content)

if not insert_match:
    print("Test records not found")
    exit(1)

# Insert it before the Test Records, with a bit of spacing
new_content = content[:insert_match.start()] + f'\n\n      {graph_html}\n' + content[insert_match.start():]

with open('src/components/StudentProfileView.jsx', 'w') as f:
    f.write(new_content)

print("Graph moved successfully.")
