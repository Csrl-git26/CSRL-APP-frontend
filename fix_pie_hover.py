import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace Pie shape prop
old_pie_shape = """isAnimationActive={false}
        shape={renderPieShape}
        activeShape={renderActiveShape}"""

new_pie_shape = """isAnimationActive={false}
        activeShape={renderActiveShape}"""

content = content.replace(old_pie_shape, new_pie_shape)

with open(file_path, 'w') as f:
    f.write(content)

