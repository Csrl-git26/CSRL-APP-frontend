import re

path = "/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx"
with open(path, "r") as f:
    content = f.read()

# Add state
state_code = "  const [showRankingModal, setShowRankingModal] = useState(false);\n"
content = content.replace(
    "const [activeStudentBar, setActiveStudentBar] = useState(null);",
    state_code + "  const [activeStudentBar, setActiveStudentBar] = useState(null);"
)

# Add onClick to card
card_html = '<div className="card" style={{ padding: 20 }}>\n              \n              {(() => {\n                const topCentres = sorted.slice(0,5)'
new_card_html = '<div className="card" style={{ padding: 20, cursor: \'pointer\' }} onClick={() => setShowRankingModal(true)} title="Click to view full Centre Rankings">\n              \n              {(() => {\n                const topCentres = sorted.slice(0,5)'

if card_html in content:
    content = content.replace(card_html, new_card_html)
else:
    print("Could not find the card html to replace")

# Add modal at the end
modal_html = """
      {showRankingModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }} onClick={() => setShowRankingModal(false)}>
          <div style={{ background: '#eef2f6', borderRadius: 16, width: '100%', maxWidth: 1000, height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: 24, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid rgba(59, 130, 246, 0.2)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                <Trophy size={24} />
                <span style={{ fontSize: 22, fontWeight: 800 }}>Centre Rankings — {selectedTestKey || 'Latest'}</span>
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
        </div>
      )}
    </div>
  );
}
"""

content = content.replace("    </div>\n  );\n}", modal_html)

with open(path, "w") as f:
    f.write(content)

print("Patch applied successfully.")
