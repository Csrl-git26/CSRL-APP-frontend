import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Restore the simple data initialization
old_init = """                   let d = { name: label, total: s.marks ?? s.score };
                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(s => { d[`${s}_pos`] = 0; d[`${s}_neg`] = 0; d[`${s}_val`] = 0; });"""
new_init = "                   let d = { name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"
content = content.replace(old_init, new_init)

# 2. Restore the simple val mapping
old_mapping = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             let val = Number(s.rawScores[matchedKey]);
                             if (val > 0) {
                                 d[`${sub}_pos`] = val;
                             } else if (val < 0) {
                                 d[`${sub}_neg`] = val;
                             }
                             d[`${sub}_val`] = val;
                          }"""

new_mapping = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }"""
content = content.replace(old_mapping, new_mapping)

# 3. Add stackOffset="sign" to BarChart
old_barchart = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>'
new_barchart = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }} stackOffset="sign">'
content = content.replace(old_barchart, new_barchart)

# 4. Restore the simple Bar components
# Let's find the whole Bars block
bars_start = '{/* Positive Bars */}'
bars_end = '</BarChart>'
# We will just regex replace the whole thing between CartesianGrid and </BarChart>
import re
new_bars_block = """                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="Physics" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Physics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `P${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `C${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Math" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Math" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Mathematics" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Biology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `B${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Botany" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `Bo${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 && v !== undefined ? `Z${v}` : ''} />
                        </Bar>
                      </BarChart>"""

content = re.sub(r'<Tooltip.*?</BarChart>', new_bars_block, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)

