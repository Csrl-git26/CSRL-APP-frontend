import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

target = """                      label={({ cx, cy, midAngle, outerRadius, name, index }) => {
                        const RADIAN = Math.PI / 180;
                        // Alternate radius to prevent overlapping
                        const radius = outerRadius + 8 + (index % 3) * 12;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const isAbove = (sorted[index]?.avg || 0) >= overallAvg;
                        return (
                          <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={9} fontWeight={600}>
                            {name}
                          </text>
                        );"""

replacement = """                      label={({ cx, cy, midAngle, outerRadius, name, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 18;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const isAbove = (sorted[index]?.avg || 0) >= overallAvg;
                        const textRotation = -midAngle + (x < cx ? 180 : 0);
                        return (
                          <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={9} fontWeight={600} transform={`rotate(${textRotation}, ${x}, ${y})`}>
                            {name}
                          </text>
                        );"""

content = content.replace(target, replacement)

with open(file_path, 'w') as f:
    f.write(content)

