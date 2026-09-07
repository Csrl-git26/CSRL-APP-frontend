with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Truncate name to 6 characters, font sizes 7, 6, 9
old_tick = """                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={12} dy={0} textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={700}>{name}</text>
                      {extra && <text x={0} y={22} dy={0} textAnchor="middle" fill="#64748b" fontSize={7}>{extra}</text>}
                      <text x={0} y={34} dy={0} textAnchor="middle" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>"""

new_tick = """                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={12} dy={0} textAnchor="middle" fill="#64748b" fontSize={7} fontWeight={700}>{name}</text>
                      {extra && <text x={0} y={22} dy={0} textAnchor="middle" fill="#64748b" fontSize={6}>{extra}</text>}
                      <text x={0} y={34} dy={0} textAnchor="middle" fill="#1e293b" fontSize={9} fontWeight={900}>{total}</text>
                    </g>"""

content = content.replace(old_tick, new_tick)

# Change truncation from 8 to 5
content = content.replace('nameSplit[0].substring(0, 8)', 'nameSplit[0].substring(0, 5)')

# 2. Change bar labels to be shorter, e.g., 'PHY' -> 'P', 'MATH' -> 'M'
# Also decrease font size to 8
import re
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `PHY \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `P${v}` : \'\'} />', content)
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `CHE \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `C${v}` : \'\'} />', content)
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `MATH \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `M${v}` : \'\'} />', content)
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `Bio \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `B${v}` : \'\'} />', content)
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `Bot \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `Bo${v}` : \'\'} />', content)
content = re.sub(r'formatter=\{\(v\) => v > 0 \? `Zoo \$\{v\}` : \'\'\} \/\>', r'formatter={(v) => v > 0 ? `Z${v}` : \'\'} />', content)

# Change font size inside labels from 9 to 8
content = content.replace('fontSize={9} fontWeight={700}', 'fontSize={8} fontWeight={700}')

# Change barSize from 22 to 24
content = content.replace('barSize={22}', 'barSize={24}')

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
