import re

path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"
with open(path, "r") as f:
    content = f.read()

# 1. Change root div to relative
content = content.replace(
    "<div style={{ display:'flex', flexDirection:'column', gap:20 }}>",
    "<div style={{ display:'flex', flexDirection:'column', gap:20, position: 'relative' }}>"
)

# 2. Change modal position to absolute and align flex-start
old_modal_style = "position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40"
new_modal_style = "position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40"
content = content.replace(old_modal_style, new_modal_style)

with open(path, "w") as f:
    f.write(content)
print("Patch applied.")
