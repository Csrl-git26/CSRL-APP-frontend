import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

target = """                  <PieChart>
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
                      activeIndex={activeQualIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setActiveQualIndex(index)}
                      onMouseLeave={() => setActiveQualIndex(-1)}
                      onClick={(entry) => onViewCentre && onViewCentre(entry.code || entry.payload?.code)}
                      style={{ cursor: 'pointer' }}
                      label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 15;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const isAbove = (sorted[index]?.qualRate || 0) >= overallAvg;
                        const textRotation = -midAngle + (x < cx ? 180 : 0);
                        return (
                          <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={9} fontWeight={600} transform={`rotate(${textRotation}, ${x}, ${y})`}>
                            {payload?.code || ""}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {sorted.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={(entry.qualRate||0) >= overallAvg ? '#3b82f6' : '#f97316'} 
                          style={{ cursor: onViewCentre ? 'pointer' : 'default', outline: 'none' }}
                          onClick={() => onViewCentre && onViewCentre(entry.code)}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isAbove = (data.qualRate || 0) >= overallAvg;
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
                  </PieChart>"""

replacement = "                  <InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />"

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Replacement successful")
else:
    print("Target block not found precisely!")
