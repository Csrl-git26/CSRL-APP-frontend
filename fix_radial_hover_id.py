import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace activeRadialIndex with activeRadialId in shape
old_radial_shape = """const renderRadialBarShape = (props, activeRadialIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
  const isActive = activeRadialIndex === index;"""

new_radial_shape = """const renderRadialBarShape = (props, activeRadialId) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, name, payload } = props;
  const currentId = name || payload?.name;
  const isActive = activeRadialId && currentId && activeRadialId === currentId;"""

content = content.replace(old_radial_shape, new_radial_shape)

# Replace state initialization
old_state = "const [activeRadialIndex, setActiveRadialIndex] = useState(null);"
new_state = "const [activeRadialId, setActiveRadialId] = useState(null);"
content = content.replace(old_state, new_state)

# Replace RadialBar props
old_radial_props = """shape={(props) => renderRadialBarShape(props, activeRadialIndex)}
                      onMouseEnter={(_, index) => setActiveRadialIndex(index)}
                      onMouseLeave={() => setActiveRadialIndex(null)}"""

new_radial_props = """shape={(props) => renderRadialBarShape(props, activeRadialId)}
                      onMouseEnter={(data) => setActiveRadialId(data?.name || data?.payload?.name)}
                      onMouseLeave={() => setActiveRadialId(null)}"""

content = content.replace(old_radial_props, new_radial_props)

with open(file_path, 'w') as f:
    f.write(content)

