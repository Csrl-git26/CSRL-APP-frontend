with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

content = content.replace("v > 0 ? `P${v}` : \\'\\'", "v > 0 ? `P${v}` : ''")
content = content.replace("v > 0 ? `C${v}` : \\'\\'", "v > 0 ? `C${v}` : ''")
content = content.replace("v > 0 ? `M${v}` : \\'\\'", "v > 0 ? `M${v}` : ''")
content = content.replace("v > 0 ? `B${v}` : \\'\\'", "v > 0 ? `B${v}` : ''")
content = content.replace("v > 0 ? `Bo${v}` : \\'\\'", "v > 0 ? `Bo${v}` : ''")
content = content.replace("v > 0 ? `Z${v}` : \\'\\'", "v > 0 ? `Z${v}` : ''")

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
