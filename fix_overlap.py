import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Remove <text> from renderActiveShape
old_active_shape = """const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, midAngle } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textRotation = -midAngle + (x < cx ? 180 : 0);
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
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={800} transform={`rotate(${textRotation}, ${x}, ${y})`}>
        {payload?.code || ""}
      </text>
    </g>
  );
};"""

new_active_shape = """const renderActiveShape = (props) => {
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

content = content.replace(old_active_shape, new_active_shape)

# 2. Update the label logic in InteractivePieChart
old_label = """        label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius + 15;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          const isAbove = (sorted[index]?.avg !== undefined ? sorted[index].avg : sorted[index]?.qualRate || 0) >= overallAvg;
          const textRotation = -midAngle + (x < cx ? 180 : 0);
          return (
            <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={9} fontWeight={600} transform={`rotate(${textRotation}, ${x}, ${y})`}>
              {payload?.code || ""}
            </text>
          );
        }}"""

new_label = """        label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius + 15;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          const isAbove = (sorted[index]?.avg !== undefined ? sorted[index].avg : sorted[index]?.qualRate || 0) >= overallAvg;
          const textRotation = -midAngle + (x < cx ? 180 : 0);
          const isActive = index === activeIndex;
          return (
            <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={isActive ? 11 : 9} fontWeight={isActive ? 900 : 600} transform={`rotate(${textRotation}, ${x}, ${y})`}>
              {payload?.code || ""}
            </text>
          );
        }}"""

content = content.replace(old_label, new_label)

with open(file_path, 'w') as f:
    f.write(content)

