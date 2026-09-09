import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderActiveShape
old_render_active_shape = """const renderActiveShape = (props) => {
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

new_render_active_shape = """const renderActiveShape = (props) => {
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
};

const InteractivePieChart = ({ sorted, overallAvg, onViewCentre }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  return (
    <PieChart>
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
        activeShape={renderActiveShape}
        onMouseEnter={(_, index) => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(-1)}
        onClick={(entry) => onViewCentre && onViewCentre(entry.code || entry.payload?.code)}
        style={{ cursor: 'pointer' }}
        label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
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
        }}
        labelLine={false}
      >
        {sorted.map((entry, index) => {
           const isAbove = (entry.avg !== undefined ? entry.avg : entry.qualRate || 0) >= overallAvg;
           return (
          <Cell 
            key={`cell-${index}`} 
            fill={isAbove ? '#3b82f6' : '#f97316'} 
            style={{ cursor: onViewCentre ? 'pointer' : 'default', outline: 'none' }}
            onClick={() => onViewCentre && onViewCentre(entry.code)}
          />
        )})}
      </Pie>
      <Tooltip 
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            const isAbove = (data.avg !== undefined ? data.avg : data.qualRate || 0) >= overallAvg;
            return (
              <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <span style={{ color: isAbove ? '#3b82f6' : '#f97316', fontWeight: 600, fontSize: 13 }}>
                  Centre {payload[0].name}
                </span>
              </div>
            );
          }
          return null;
        }}
      />
    </PieChart>
  );
};
"""
content = content.replace(old_render_active_shape, new_render_active_shape)

# 2. Remove state from InsightsDashboard
content = content.replace("  const [activeAvgIndex, setActiveAvgIndex] = useState(-1);\n", "")
content = content.replace("  const [activeQualIndex, setActiveQualIndex] = useState(-1);\n", "")

# 3. Replace <PieChart> blocks with <InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />
avg_pie_match = re.search(r'<PieChart>.*?Centre \{payload\[0\].name\}.*?</PieChart>', content, flags=re.DOTALL)
if avg_pie_match:
    content = content.replace(avg_pie_match.group(0), "<InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />", 1)

qual_pie_match = re.search(r'<PieChart>.*?Centre \{payload\[0\].name\}.*?</PieChart>', content, flags=re.DOTALL)
if qual_pie_match:
    content = content.replace(qual_pie_match.group(0), "<InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />", 1)

with open(file_path, 'w') as f:
    f.write(content)

