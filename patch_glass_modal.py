import re

path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"
with open(path, "r") as f:
    content = f.read()

# Add LineChart, Line to imports
if "LineChart" not in content:
    content = content.replace(
        "import { Rectangle, Sector, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';",
        "import { Rectangle, Sector, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, LineChart, Line } from 'recharts';"
    )

# Revert relative positioning on root div (from previous fix)
content = content.replace(
    "<div style={{ display:'flex', flexDirection:'column', gap:20, position: 'relative' }}>",
    "<div style={{ display:'flex', flexDirection:'column', gap:20 }}>"
)

new_modal = """      {showRankingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowRankingModal(false)}>
          {/* Glassmorphic Container */}
          <div style={{ background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 24, width: '95vw', maxWidth: 1400, height: '85vh', display: 'flex', gap: 20, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: 24, position: 'relative', backdropFilter: 'blur(20px)' }} onClick={e => e.stopPropagation()}>
            
            {/* Close button */}
            <div style={{ position: 'absolute', top: 16, right: 20, cursor: 'pointer', color: '#64748b', transition: 'color 0.2s', zIndex: 10 }} onClick={() => setShowRankingModal(false)}>
              <span style={{ fontSize: 28, lineHeight: 1, fontWeight: 300 }}>×</span>
            </div>

            {/* Left Card: Centre Rankings */}
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid rgba(59, 130, 246, 0.2)', paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                  <Trophy size={24} />
                  <span style={{ fontSize: 20, fontWeight: 800 }}>Centre Rankings — {selectedTestKey || 'Latest'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '6px 12px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                   <span style={{ fontWeight: 800, color: '#1e293b' }}>Test:</span>
                   <span style={{ fontWeight: 700, color: '#475569' }}>{selectedTestKey || 'Latest'}</span>
                   <span style={{ fontSize: 10 }}>▼</span>
                </div>
              </div>
              
              <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0))} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#1e293b', angle: -90, textAnchor: 'end' }} interval={0} dx={-4} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#1e293b' }} domain={[0, 180]} ticks={[0, 45, 90, 135, 180]} label={{ value: 'Average Score', angle: -90, position: 'insideLeft', style: { fontWeight: 900, fill: '#475569', fontSize: 14 } }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div style={{ background: '#1e293b', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                            <div style={{ marginBottom: 4, color: '#93c5fd' }}>{payload[0].payload.code}</div>
                            <div>Avg: {Math.round(payload[0].payload.avg)}</div>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Bar dataKey="avg" fill="#1e3a8a" radius={[6, 6, 6, 6]} barSize={22}>
                      <LabelList dataKey="avg" content={(props) => {
                        const { x, y, width, value, index } = props;
                        const c = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0))[index];
                        const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                        
                        return (
                          <g>
                            <text x={x + width / 2} y={y - 12} fill="#1e293b" fontSize={11} fontWeight={900} textAnchor="middle">
                              {Math.round(value)}
                            </text>
                            {isAlert && (
                              <g>
                                <circle cx={x + width / 2} cy={y - 2} r={8} fill="rgba(239, 68, 68, 0.4)" filter="blur(3px)" />
                                <circle cx={x + width / 2} cy={y - 2} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                              </g>
                            )}
                          </g>
                        );
                      }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Card: Centre Performance Trend */}
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb' }}>Centre Performance Trend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '6px 12px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                   <span style={{ fontWeight: 800, color: '#1e293b' }}>ABB</span>
                   <span style={{ fontSize: 10 }}>▼</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                 <div style={{ background: '#3b82f6', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>MARKS</div>
                 <div style={{ background: '#fff', color: '#64748b', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>ACCURACY</div>
                 <div style={{ background: '#fff', color: '#64748b', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>ATTEMPTED</div>
                 <div style={{ background: '#fff', color: '#64748b', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>CORRECT</div>
                 <div style={{ background: '#fff', color: '#64748b', padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>RANK</div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 16, background: '#fff', padding: '8px 16px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked readOnly /><span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Physics</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked readOnly /><span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Chemistry</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked readOnly /><span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Math</span></div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" checked readOnly /><span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>Total</span></div>
              </div>

              <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: 'FMT01', physics: 29, chemistry: 40, math: 29, total: 110 },
                    { name: 'FMT02', physics: 29, chemistry: 29, math: 40, total: 108 },
                    { name: 'FMT03', physics: 65, chemistry: 44, math: 59, total: 168 },
                    { name: 'FMT04', physics: 15, chemistry: 68, math: 68, total: 148 },
                    { name: 'FMT05', physics: 76, chemistry: 55, math: 55, total: 184 },
                    { name: 'FMT06', physics: 84, chemistry: 44, math: 61, total: 189 },
                    { name: 'FMT08', physics: 63, chemistry: 53, math: 55, total: 171 },
                  ]} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b', angle: -45, textAnchor: 'end' }} dx={-10} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }} domain={[0, 189]} ticks={[0, 50, 100, 150, 189]} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 700 }} />
                    <Line type="monotone" dataKey="chemistry" stroke="#f97316" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }} label={{ position: 'top', fill: '#f97316', fontSize: 11, fontWeight: 800 }} />
                    <Line type="monotone" dataKey="math" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} label={{ position: 'bottom', fill: '#10b981', fontSize: 11, fontWeight: 800 }} />
                    <Line type="monotone" dataKey="physics" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} label={{ position: 'top', fill: '#3b82f6', fontSize: 11, fontWeight: 800 }} />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }} label={{ position: 'top', fill: '#8b5cf6', fontSize: 11, fontWeight: 800 }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 20 }} iconType="circle" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}"""

content = re.sub(r'      \{showRankingModal && \([\s\S]*\}\s*\)\s*}\s*</div>\s*\);\s*}\s*$', new_modal + '\n    </div>\n  );\n}\n', content)

with open(path, "w") as f:
    f.write(content)
print("Updated modal!")
