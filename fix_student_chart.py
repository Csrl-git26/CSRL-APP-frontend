import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Add activeStudentBar state to InsightsDashboard
state_str = "  const [selectedTestKey, setSelectedTestKey] = useState(data.testKeys ? data.testKeys[0] : null);"
new_state_str = state_str + "\n  const [activeStudentBar, setActiveStudentBar] = useState(null);"
if "const [activeStudentBar, setActiveStudentBar] = useState(null);" not in content:
    content = content.replace(state_str, new_state_str)

# 2. Inject renderStudentBarShape
shape_func = """
const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index && activeStudentBar.dataKey === dataKey;
  if (isActive) {
    return <rect x={x - 2} y={y - 2} width={width + 4} height={height + 4} fill={fill} style={{ filter: 'brightness(1.1)', transition: 'all 0.2s' }} />;
  }
  return <rect x={x} y={y} width={width} height={height} fill={fill} style={{ transition: 'all 0.2s' }} />;
};
"""
if "const renderStudentBarShape" not in content:
    parts = content.split("export default function InsightsDashboard", 1)
    content = parts[0] + shape_func + "\nexport default function InsightsDashboard" + parts[1]

# 3. Modify <Bar ...> to add shape and mouse events
subjects = ["Physics", "Chemistry", "Math", "Mathematics", "Biology", "Botany", "Zoology"]
for sub in subjects:
    search_str = f'<Bar dataKey="{sub}" stackId="a" fill='
    # check if not already replaced
    if 'shape={(props)' not in search_str:
        # We need to find the specific Bar tags and replace them.
        # But some bars already have isAnimationActive={false} added recently
        pass

# It's better to just do a regex replace for the Bar tags inside the BarChart
import re

def replacer(match):
    full_match = match.group(0)
    dataKey = match.group(1)
    
    # Check if we already modified it
    if "shape=" in full_match:
        return full_match
        
    return full_match.replace(
        f'<Bar dataKey="{dataKey}"', 
        f'<Bar shape={{(props) => renderStudentBarShape(props, "{dataKey}", title, activeStudentBar)}} onMouseEnter={{(_, index) => setActiveStudentBar({{chartId: title, index, dataKey: "{dataKey}"}})}} onMouseLeave={{() => setActiveStudentBar(null)}} dataKey="{dataKey}"'
    )

content = re.sub(r'<Bar\s+dataKey="([^"]+)"\s+stackId="a"\s+fill="[^"]+"\s+barSize=\{24\}\s+isAnimationActive=\{false\}\s+onClick', replacer, content)

with open(file_path, 'w') as f:
    f.write(content)

