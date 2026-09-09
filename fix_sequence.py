import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update chartData object initialization to have _pos and _neg keys initialized to 0
old_data_init = """                   let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score, Physics: 0, Chemistry: 0, Math: 0, Mathematics: 0, Biology: 0, Botany: 0, Zoology: 0 };"""
new_data_init = """                   let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score };
                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                       d[`${sub}_pos`] = 0;
                       d[`${sub}_neg`] = 0;
                   });"""
content = content.replace(old_data_init, new_data_init)

# 2. Update mapping logic to split pos and neg
old_mapping = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }"""
new_mapping = """                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             let val = Number(s.rawScores[matchedKey]);
                             if (val >= 0) {
                                 d[`${sub}_pos`] = val;
                             } else {
                                 d[`${sub}_neg`] = val;
                             }
                          }"""
content = content.replace(old_mapping, new_mapping)

# 3. Update Bar components to render POSITIVE forwards and NEGATIVE backwards
old_bars_block_start = '<Bar dataKey="Physics"'
old_bars_block_end = '</BarChart>'
# Find the exact text to replace
import re
match = re.search(r'<Bar dataKey="Physics".*?</BarChart>', content, flags=re.DOTALL)
if match:
    old_bars = match.group(0)
    new_bars = """<Bar dataKey="Physics_pos" stackId="pos" fill="#3b82f6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Physics_pos" content={(props) => <CustomBarLabel {...props} prefix="P" />} />
                        </Bar>
                        <Bar dataKey="Chemistry_pos" stackId="pos" fill="#8b5cf6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Chemistry_pos" content={(props) => <CustomBarLabel {...props} prefix="C" />} />
                        </Bar>
                        <Bar dataKey="Math_pos" stackId="pos" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Math_pos" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Mathematics_pos" stackId="pos" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Mathematics_pos" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Biology_pos" stackId="pos" fill="#ec4899" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_pos" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>
                        <Bar dataKey="Botany_pos" stackId="pos" fill="#14b8a6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Botany_pos" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />
                        </Bar>
                        <Bar dataKey="Zoology_pos" stackId="pos" fill="#f59e0b" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Zoology_pos" content={(props) => <CustomBarLabel {...props} prefix="Z" />} />
                        </Bar>

                        {/* Negative bars declared in REVERSE order so they grow leftwards in P -> C -> M sequence visually */}
                        <Bar dataKey="Zoology_neg" stackId="neg" fill="#f59e0b" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Zoology_neg" content={(props) => <CustomBarLabel {...props} prefix="Z" />} />
                        </Bar>
                        <Bar dataKey="Botany_neg" stackId="neg" fill="#14b8a6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Botany_neg" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />
                        </Bar>
                        <Bar dataKey="Biology_neg" stackId="neg" fill="#ec4899" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_neg" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>
                        <Bar dataKey="Mathematics_neg" stackId="neg" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Mathematics_neg" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Math_neg" stackId="neg" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Math_neg" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar dataKey="Chemistry_neg" stackId="neg" fill="#8b5cf6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Chemistry_neg" content={(props) => <CustomBarLabel {...props} prefix="C" />} />
                        </Bar>
                        <Bar dataKey="Physics_neg" stackId="neg" fill="#3b82f6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Physics_neg" content={(props) => <CustomBarLabel {...props} prefix="P" />} />
                        </Bar>
                      </BarChart>"""
    
    content = content.replace(old_bars, new_bars)

with open(file_path, 'w') as f:
    f.write(content)

