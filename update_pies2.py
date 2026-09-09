import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Instead of complex regex, let's just replace the exact paddingAngle line to inject the new properties
# Since there are two Pie charts, we can use a counter
count = 0
def replacer(match):
    global count
    count += 1
    state_var = "activeAvgIndex" if count == 1 else "activeQualIndex"
    return match.group(0) + f"""
                      activeIndex={{{state_var}}}
                      activeShape={{renderActiveShape}}
                      onMouseEnter={{(_, index) => setActive{state_var.replace('active', '')}(index)}}
                      onMouseLeave={{() => setActive{state_var.replace('active', '')}(-1)}}
                      onClick={{(entry) => onViewCentre && onViewCentre(entry.code)}}
                      style={{{{ cursor: 'pointer' }}}}"""

content = re.sub(r'paddingAngle=\{1\}', replacer, content)

with open(file_path, 'w') as f:
    f.write(content)

