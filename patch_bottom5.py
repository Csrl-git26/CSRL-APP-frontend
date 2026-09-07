with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Add bottom5 definition
content = content.replace(
    'const top5    = (topRanked    || []).slice(0,5);',
    'const top5    = (topRanked    || []).slice(0,5);\n  const bottom5 = (bottomRanked || []).slice(0,5);'
)

# Refactor the chart rendering so we can reuse it
# The chartData logic and BarChart can be put into a helper function inside InsightsDashboard.

helper_func = """
  const renderStudentChart = (students, title, icon, color) => {
    return (
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc', flex: 1, minWidth: 0 }}>
          <SectionTitle Icon={icon} color={color}>{title} — {selectedTestKey||'Overall'}</SectionTitle>
          {students.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : (() => {
                const chartData = students.map(s => {
                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   const centre = s.center || '';
                   const label = centre ? `${shortName} (${centre})` : shortName;
                   
                   let d = { name: label, total: s.marks ?? s.score };
                   if (s.rawScores) {
                      ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                          const keys = Object.keys(s.rawScores);
                          let matchedKey = null;
                          if (selectedTestKey && selectedTestKey !== 'Multiple Tests') {
                             matchedKey = keys.find(k => k === `${selectedTestKey}_${sub}` || k === `${selectedTestKey}_${sub.toUpperCase()}` || k === `${selectedTestKey}_${sub.toLowerCase()}`);
                          }
                          if (!matchedKey) {
                             matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
                          }
                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }
                      });
                   }
                   return d;
                });
                
                const renderCustomTick = (props) => {
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
                );
              })()
          }
        </div>
    );
  };
"""

content = content.replace(
    'const totalStudents = profiles.length;',
    helper_func + '\n  const totalStudents = profiles.length;'
)

# Now replace the original Left Column: Top 5 Students block with the grid of both charts.

import re

# We want to replace everything from {/* Left Column: Top 5 Students */} to the end of that div (</div>)
# which is just before </div> {/* Close Stacked Left Column */}
pattern = r'\{\/\* Left Column: Top 5 Students \*\/\}.*?(?=\<\/div\>\s*\{\/\* Close Stacked Left Column \*\/\})'

replacement_block = """{/* Left Column: Top & Bottom 5 Students */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10 }}>
          {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
          {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#ef4444')}
        </div>
        """

new_content = re.sub(pattern, replacement_block, content, flags=re.DOTALL)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(new_content)
