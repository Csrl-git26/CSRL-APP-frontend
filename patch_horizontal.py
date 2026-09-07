with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old_chart = """                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="Physics" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6" />
                        <Bar dataKey="Math" stackId="a" fill="#10b981" />
                        <Bar dataKey="Mathematics" stackId="a" fill="#10b981" />
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899" />
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6" />
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>"""

new_chart = """                    <ResponsiveContainer>
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

content = content.replace(old_chart, new_chart)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
