import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Remove the CustomStudentTooltip function
pattern = r"const CustomStudentTooltip = \(\{ active, payload, label \}\) => \{.*?\n\};\n"
content = re.sub(pattern, "", content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

