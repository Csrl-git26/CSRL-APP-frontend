with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

target = """                return (
                  <div style={{ height: 165, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 35, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis yAxisId="left" type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} width={75} tick={{fontSize: 9, fill: '#64748b', fontWeight: 600}} />
                        <YAxis yAxisId="right" orientation="right" type="category" dataKey="total" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#1e293b', fontWeight: 800}} interval={0} width={25} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar yAxisId="left" dataKey="Physics" stackId="a" fill="#3b82f6" barSize={18}>
                          <LabelList dataKey="Physics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `PHY ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Chemistry" stackId="a" fill="#8b5cf6">
                          <LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `CHE ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Math" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Math" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `MATH ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Mathematics" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `MATH ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Biology" stackId="a" fill="#ec4899">
                          <LabelList dataKey="Biology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bio ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Botany" stackId="a" fill="#14b8a6">
                          <LabelList dataKey="Botany" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bot ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Zoology" stackId="a" fill="#f59e0b">
                          <LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Zoo ${v}` : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );"""

replacement = """                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const total = chartData.find(d => d.name === payload.value)?.total || '';
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={10} dy={0} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={600}>{name}</text>
                      {extra && <text x={0} y={20} dy={0} textAnchor="middle" fill="#64748b" fontSize={8}>{extra}</text>}
                      <text x={0} y={32} dy={0} textAnchor="middle" fill="#1e293b" fontSize={10} fontWeight={800}>{total}</text>
                    </g>
                  );
                };
                
                return (
                  <div style={{ height: 210, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} />
                        <YAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="Physics" stackId="a" fill="#3b82f6" barSize={35}>
                          <LabelList dataKey="Physics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `PHY ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6">
                          <LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `CHE ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Math" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Math" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `MATH ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Mathematics" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `MATH ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899">
                          <LabelList dataKey="Biology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `Bio ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6">
                          <LabelList dataKey="Botany" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `Bot ${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b">
                          <LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? `Zoo ${v}` : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );"""

content = content.replace(target, replacement)
with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
