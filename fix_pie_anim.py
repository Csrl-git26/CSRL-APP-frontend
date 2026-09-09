import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add isAnimationActive={false} to the Pie inside InteractivePieChart
content = content.replace('activeIndex={activeIndex}', 'activeIndex={activeIndex}\n        isAnimationActive={false}')

with open(file_path, 'w') as f:
    f.write(content)

