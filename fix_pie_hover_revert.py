import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# We need to make renderPieShape just be the default shape, but the problem is Recharts Pie 
# overriding activeShape when a custom shape is provided unless handled internally.
# Actually, if we just check activeIndex inside a single shape function, it works flawlessly for Pie!

old_pie_shapes = """const renderPieShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={4} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={4} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={4} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 4} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={4} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};"""

new_pie_shapes = """const renderPieShape = (props, activeIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
  const isActive = activeIndex === index;
  
  const currentOuter = isActive ? outerRadius + 4 : outerRadius;
  const shadow = isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))';
  
  return (
    <g style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={4} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={4} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};"""

content = content.replace(old_pie_shapes, new_pie_shapes)

old_pie_props = """activeIndex={activeIndex}
        isAnimationActive={false}
        activeShape={renderActiveShape}"""

new_pie_props = """activeIndex={activeIndex}
        isAnimationActive={false}
        shape={(props) => renderPieShape(props, activeIndex)}"""

content = content.replace(old_pie_props, new_pie_props)

with open(file_path, 'w') as f:
    f.write(content)

