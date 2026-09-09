import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update renderCustomTick to handle clicks
old_tick = """                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const total = chartData.find(d => d.name === payload.value)?.total || '';
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={-5} y={-4} textAnchor="end" fill="#64748b" fontSize={9} fontWeight={700}>{name} {extra}</text>
                      <text x={-5} y={8} textAnchor="end" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>
                  );
                };"""

new_tick = """                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const studentData = chartData.find(d => d.name === payload.value);
                  const total = studentData?.total || '';
                  const studentId = studentData?.studentId;
                  return (
                    <g transform={`translate(${x},${y})`} onClick={() => { if(onViewStudent && studentId) onViewStudent(studentId); }} style={{ cursor: 'pointer' }}>
                      <rect x={-90} y={-15} width={90} height={30} fill="transparent" />
                      <text x={-5} y={-4} textAnchor="end" fill="#64748b" fontSize={9} fontWeight={700}>{name} {extra}</text>
                      <text x={-5} y={8} textAnchor="end" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>
                  );
                };"""
content = content.replace(old_tick, new_tick)

# 2. Add onClick to all Bars
# We will just replace `isAnimationActive={false}>` with `isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>`

content = content.replace("isAnimationActive={false}>", "isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>")

with open(file_path, 'w') as f:
    f.write(content)

