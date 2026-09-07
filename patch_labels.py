with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Reduce barSize to 22
content = content.replace('barSize={35}', 'barSize={22}')

# 2. Fix the names truncation and font size
# Let's change the shortName logic
import re

old_name_logic = """                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   const centre = s.center || '';
                   const label = centre ? `${shortName} (${centre})` : shortName;"""

new_name_logic = """                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0].substring(0, 8); // truncate to 8 chars
                   if (shortName.length < 3 && nameSplit.length > 1) {
                       shortName += ' ' + nameSplit[1].substring(0, 3);
                   }
                   const centre = s.center || '';
                   const label = centre ? `${shortName} (${centre})` : shortName;"""

content = content.replace(old_name_logic, new_name_logic)

# 3. For the negative bars overlapping the XAxis labels: 
# The issue is Recharts puts XAxis at y=0.
# We can fix this by setting the YAxis domain to force the minimum to be at least below the lowest negative value, 
# and maybe just push the custom tick labels down by a fixed amount? No, if y is 0, y is physically in the middle of the chart.
# Instead of `tick={renderCustomTick}`, we can use a `Legend` or just let Recharts put the tick at the bottom if we don't have negative values.
# Actually, if we just clamp the values for the visual stack, it's so much easier and doesn't break the layout. 
# "let val = Number(s.rawScores[matchedKey]); d[sub] = val > 0 ? val : 0;"

old_val_logic = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }"""

new_val_logic = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             let val = Number(s.rawScores[matchedKey]);
                             d[sub] = val > 0 ? val : 0; // clamp to 0 to prevent downward bars breaking layout
                          }"""

content = content.replace(old_val_logic, new_val_logic)

# 4. Decrease font size of XAxis custom tick
old_tick = """                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={10} dy={0} textAnchor="middle" fill="#64748b" fontSize={9} fontWeight={600}>{name}</text>
                      {extra && <text x={0} y={20} dy={0} textAnchor="middle" fill="#64748b" fontSize={8}>{extra}</text>}
                      <text x={0} y={32} dy={0} textAnchor="middle" fill="#1e293b" fontSize={10} fontWeight={800}>{total}</text>
                    </g>"""

new_tick = """                    <g transform={`translate(${x},${y})`}>
                      <text x={0} y={12} dy={0} textAnchor="middle" fill="#64748b" fontSize={8} fontWeight={700}>{name}</text>
                      {extra && <text x={0} y={22} dy={0} textAnchor="middle" fill="#64748b" fontSize={7}>{extra}</text>}
                      <text x={0} y={34} dy={0} textAnchor="middle" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>"""

content = content.replace(old_tick, new_tick)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
