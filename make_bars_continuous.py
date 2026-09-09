import os

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Add Rectangle to imports
old_import = "Sector, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList"
new_import = "Rectangle, " + old_import
content = content.replace(old_import, new_import)

# Update renderStudentBarShape
old_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  
  const gap = 2;
  const adjustedX = x + gap/2;
  const adjustedWidth = Math.max(0, width - gap);
  
  const adjustedY = isActive ? y - 2 : y;
  const adjustedHeight = isActive ? height + 4 : height;
  
  return (
    <g>
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={fill} rx={6} ry={6} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3D)" rx={6} ry={6} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};"""

new_shape = """const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  
  let radius = [0, 0, 0, 0];
  if (dataKey === "Physics") {
    radius = [6, 0, 0, 6];
  } else if (dataKey === "Math" || dataKey === "Mathematics" || dataKey === "Zoology" || dataKey === "Biology") {
    radius = [0, 6, 6, 0];
  }

  const adjustedX = x;
  const adjustedWidth = Math.max(0, width);
  
  const adjustedY = isActive ? y - 2 : y;
  const adjustedHeight = isActive ? height + 4 : height;
  
  return (
    <g>
      <Rectangle x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={fill} radius={radius} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <Rectangle x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3D)" radius={radius} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};"""

content = content.replace(old_shape, new_shape)

with open(file_path, 'w') as f:
    f.write(content)

