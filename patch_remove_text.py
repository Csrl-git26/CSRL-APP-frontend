import re

with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Remove the "AT RISK / ON TRACK" block
old_status_div = """                      <div style={{ fontSize:9, fontWeight:800, color: color, letterSpacing: '0.2px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {isAlert ? 'AT RISK' : 'ON TRACK'}
                      </div>"""

content = content.replace(old_status_div, "")

# 2. Decrease the padding in the gauge container and remove marginBottom on the gauge wrapper
content = content.replace(
    "padding:'8px 4px 6px 4px'",
    "padding:'6px 2px 4px 2px'"
)
content = content.replace(
    "marginBottom: '8px'",
    "marginBottom: '4px'"
)

# 3. Reduce gap between the gauge cards from 3 to 2 for a slightly tighter fit
content = content.replace(
    "gridTemplateColumns:'repeat(5,1fr)', gap:3",
    "gridTemplateColumns:'repeat(5,1fr)', gap:2"
)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
