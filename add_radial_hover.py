import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Replace renderRadialBarShape
old_radial_shape = """const renderRadialBarShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={10} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={10} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};"""

new_radial_shape = """const renderRadialBarShape = (props, activeRadialIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
  const isActive = activeRadialIndex === index;
  
  const currentInner = isActive ? innerRadius - 2 : innerRadius;
  const currentOuter = isActive ? outerRadius + 2 : outerRadius;
  const shadow = isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))';
  
  return (
    <g style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={10} />
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={10} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};"""

content = content.replace(old_radial_shape, new_radial_shape)

# 2. Add activeRadialIndex state
state_search = "const [activeStudentBar, setActiveStudentBar] = useState(null);"
if "const [activeRadialIndex, setActiveRadialIndex] = useState(null);" not in content:
    content = content.replace(state_search, state_search + "\n  const [activeRadialIndex, setActiveRadialIndex] = useState(null);")

# 3. Modify RadialBar
old_radial_bar = """<RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={renderRadialBarShape}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />"""

new_radial_bar = """<RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialIndex)}
                      onMouseEnter={(_, index) => setActiveRadialIndex(index)}
                      onMouseLeave={() => setActiveRadialIndex(null)}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />"""

content = content.replace(old_radial_bar, new_radial_bar)

with open(file_path, 'w') as f:
    f.write(content)

