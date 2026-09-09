import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderActiveShape and add renderPieShape
old_active_shape = """const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};"""

new_shapes = """const renderPieShape = (props) => {
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

content = content.replace(old_active_shape, new_shapes)

# 2. Add shape prop to Pie and defs
old_pie = """<PieChart>
      <Pie 
        data={sorted} 
        dataKey="equalSlice"
        startAngle={180}
        endAngle={-180} 
        nameKey="code" 
        cx="50%" 
        cy="50%" 
        innerRadius={35} 
        outerRadius={55} 
        paddingAngle={1}
        activeIndex={activeIndex}
        isAnimationActive={false}
        activeShape={renderActiveShape}"""

new_pie = """<PieChart>
      <defs>
        <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <Pie 
        data={sorted} 
        dataKey="equalSlice"
        startAngle={180}
        endAngle={-180} 
        nameKey="code" 
        cx="50%" 
        cy="50%" 
        innerRadius={35} 
        outerRadius={55} 
        paddingAngle={3}
        activeIndex={activeIndex}
        isAnimationActive={false}
        shape={renderPieShape}
        activeShape={renderActiveShape}"""

content = content.replace(old_pie, new_pie)

# 3. Add renderRadialBarShape and inject it into RadialBar
new_radial_shape = """const renderRadialBarShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={10} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={10} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};
"""

# Inject before default export
parts = content.split("export default function InsightsDashboard", 1)
content = parts[0] + new_radial_shape + "\nexport default function InsightsDashboard" + parts[1]


old_radial = """<RadialBarChart 
                    cx="40%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      cornerRadius={10}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />"""

new_radial = """<RadialBarChart 
                    cx="40%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >
                    <defs>
                      <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                        <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                        <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={renderRadialBarShape}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />"""

content = content.replace(old_radial, new_radial)

with open(file_path, 'w') as f:
    f.write(content)

