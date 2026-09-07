with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Increase chart height to give rows more breathing room
content = content.replace(
    'height: 115, width:',
    'height: 165, width:'
)

# Reduce Y-axis tick font size and adjust width
content = content.replace(
    "interval={0} width={80}",
    "interval={0} width={75} tick={{fontSize: 9, fill: '#64748b', fontWeight: 600}}"
)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
