import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderRadialBarShape
old_radial_shape = """const renderRadialBarShape = (props, activeRadialId) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, name, payload } = props;
  const currentId = name || payload?.name;
  const isActive = activeRadialId && currentId && activeRadialId === currentId;
  
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

new_radial_shape = """const renderRadialBarShape = (props, activeRadialIndex, onViewCentre, setActiveRadialIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index, name, payload } = props;
  const isActive = activeRadialIndex === index;
  
  const currentInner = isActive ? innerRadius - 2 : innerRadius;
  const currentOuter = isActive ? outerRadius + 4 : outerRadius;
  const shadow = isActive ? 'drop-shadow(0px 6px 12px rgba(0,0,0,0.3)) brightness(1.2)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))';
  
  const handleClick = (e) => {
    e.stopPropagation();
    const id = name || payload?.name;
    if (onViewCentre && id) onViewCentre(id);
  };
  
  return (
    <g 
      style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
      onMouseEnter={() => setActiveRadialIndex(index)}
      onMouseLeave={() => setActiveRadialIndex(null)}
      onClick={handleClick}
    >
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={10} />
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={10} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};"""

content = content.replace(old_radial_shape, new_radial_shape)

# 2. Revert activeRadialId state back to activeRadialIndex
old_state = "const [activeRadialId, setActiveRadialId] = useState(null);"
new_state = "const [activeRadialIndex, setActiveRadialIndex] = useState(null);"
content = content.replace(old_state, new_state)

# 3. Update RadialBar to remove duplicate events and fix label pointer events
old_radial_bar = """<RadialBar 
                      isAnimationActive={false}
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialId)}
                      onMouseEnter={(data) => setActiveRadialId(data?.name || data?.payload?.name)}
                      onMouseLeave={() => setActiveRadialId(null)}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />"""

new_radial_bar = """<RadialBar 
                      isAnimationActive={false}
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialIndex, onViewCentre, setActiveRadialIndex)}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%`, pointerEvents: 'none' }}
                    />"""

content = content.replace(old_radial_bar, new_radial_bar)

with open(file_path, 'w') as f:
    f.write(content)

