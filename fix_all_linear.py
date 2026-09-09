import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update the mapping logic
old_data_init = """                   let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score };
                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                       d[`${sub}_pos`] = 0;
                       d[`${sub}_neg`] = 0;
                   });
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
                             let val = Number(s.rawScores[matchedKey]);
                             if (val >= 0) {
                                 d[`${sub}_pos`] = val;
                             } else {
                                 d[`${sub}_neg`] = val;
                             }
                          }
                      });
                   }"""

new_data_init = """                   let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score };
                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                       d[sub] = 0;
                       d[`${sub}_orig`] = 0;
                   });
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
                             let val = Number(s.rawScores[matchedKey]);
                             d[sub] = Math.abs(val); // Always positive for linear right-stacking
                             d[`${sub}_orig`] = val; // Store original for label
                          }
                      });
                   }"""

content = content.replace(old_data_init, new_data_init)

# 2. Update the BarChart definition (remove stackOffset="sign")
content = content.replace('stackOffset="sign"', '')

# 3. Replace the massive Bar definitions with single blocks
import re
match = re.search(r'<Bar dataKey="Physics_pos".*?</BarChart>', content, flags=re.DOTALL)
if match:
    old_bars = match.group(0)
    new_bars = """<Bar dataKey="Physics" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Physics_orig" content={(props) => <CustomBarLabel {...props} prefix="P" />} />
                        </Bar>
                        <Bar dataKey="Chemistry" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Chemistry_orig" content={(props) => <CustomBarLabel {...props} prefix="C" />} />
                        </Bar>
                        <Bar dataKey="Math" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Math_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Mathematics" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Mathematics_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_orig" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>
                        <Bar dataKey="Botany" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Botany_orig" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />
                        </Bar>
                        <Bar dataKey="Zoology" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Zoology_orig" content={(props) => <CustomBarLabel {...props} prefix="Z" />} />
                        </Bar>
                      </BarChart>"""
    content = content.replace(old_bars, new_bars)

with open(file_path, 'w') as f:
    f.write(content)

