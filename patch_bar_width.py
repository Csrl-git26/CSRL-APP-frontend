with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Remove marginRight: 'auto' from center
content = content.replace(
    "fontSize:8, color:'#64748b', fontWeight:600, flexShrink:0, marginRight: 'auto'",
    "fontSize:8, color:'#64748b', fontWeight:600, flexShrink:0"
)

# Make bar graph fill remaining space
content = content.replace(
    """          <div style={{ 
            flexShrink: 0, 
            width: '100px', """,
    """          <div style={{ 
            flex: 1, 
"""
)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
