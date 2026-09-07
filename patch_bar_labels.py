with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old_chart = """                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} width={60} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="Physics" stackId="a" fill="#3b82f6" barSize={14} />
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="Math" stackId="a" fill="#10b981" />
                        <Bar dataKey="Mathematics" stackId="a" fill="#10b981" />
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899" />
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6" />
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>"""

# Using LabelList for labels inside bars (only if > 0 handled by formatter ideally, or just standard)
# Add import LabelList if not there? Wait, LabelList is part of recharts. Let's make sure it's imported.
# It might not be imported in InsightsDashboard.jsx. Let's import it first.

new_chart = """                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 0, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis yAxisId="left" type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} width={50} />
                        <YAxis yAxisId="right" orientation="right" type="category" dataKey="total" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#1e293b', fontWeight: 800}} interval={0} width={25} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar yAxisId="left" dataKey="Physics" stackId="a" fill="#3b82f6" barSize={18}>
                          <LabelList dataKey="Physics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Chemistry" stackId="a" fill="#8b5cf6">
                          <LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Math" stackId="a" fill="#10b981">
                          <LabelList dataKey="Math" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Mathematics" stackId="a" fill="#10b981">
                          <LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Biology" stackId="a" fill="#ec4899">
                          <LabelList dataKey="Biology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Botany" stackId="a" fill="#14b8a6">
                          <LabelList dataKey="Botany" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Zoology" stackId="a" fill="#f59e0b">
                          <LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>"""

content = content.replace(old_chart, new_chart)

# ensure LabelList is imported
if 'LabelList' not in content:
    content = content.replace("from 'recharts';", ", LabelList } from 'recharts';")

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
