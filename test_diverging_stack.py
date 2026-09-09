import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update data mapping to populate _pos and _neg separately, and keep original value for labels
old_mapping = """                   let posSum = 0;
                   let negSum = 0;
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
                             if (val === 0) return;
                             if (val > 0) {
                                 d[sub] = [posSum, posSum + val];
                                 posSum += val;
                             } else {
                                 d[sub] = [negSum + val, negSum];
                                 negSum += val;
                             }
                             d[`${sub}_val`] = val;
                          }
                      });
                   }"""

new_mapping = """                   if (s.rawScores) {
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
                             if (val > 0) {
                                 d[`${sub}_pos`] = val;
                             } else if (val < 0) {
                                 d[`${sub}_neg`] = val;
                             }
                             d[`${sub}_val`] = val;
                          }
                      });
                   }"""

content = content.replace(old_mapping, new_mapping)

# 2. Update BarChart to restore stackId and use _pos / _neg
old_barchart_start = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }} barGap="-100%">'
new_barchart_start = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>'
content = content.replace(old_barchart_start, new_barchart_start)

# We need to replace the Bars section completely
old_bars = """                        <Bar dataKey="Physics" fill="#3b82f6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Physics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `P${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Chemistry" fill="#8b5cf6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Chemistry_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `C${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Math" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Math_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Mathematics" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Mathematics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Biology" fill="#ec4899" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Biology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `B${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Botany" fill="#14b8a6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Botany_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `Bo${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Zoology" fill="#f59e0b" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Zoology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v !== 0 ? `Z${v}` : ''} />
                        </Bar>"""

new_bars = """                        {/* Positive Bars */}
                        <Bar dataKey="Physics_pos" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Physics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `P${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Chemistry_pos" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Chemistry_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `C${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Math_pos" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Math_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Mathematics_pos" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Mathematics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Biology_pos" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Biology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `B${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Botany_pos" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Botany_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bo${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Zoology_pos" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Zoology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Z${v}` : ''} />
                        </Bar>

                        {/* Negative Bars */}
                        <Bar dataKey="Physics_neg" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Physics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `P${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Chemistry_neg" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Chemistry_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `C${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Math_neg" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Math_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Mathematics_neg" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Mathematics_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `M${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Biology_neg" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Biology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `B${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Botany_neg" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Botany_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `Bo${v}` : ''} />
                        </Bar>
                        <Bar dataKey="Zoology_neg" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={false}>
                          <LabelList dataKey="Zoology_val" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v < 0 ? `Z${v}` : ''} />
                        </Bar>"""

content = content.replace(old_bars, new_bars)

with open(file_path, 'w') as f:
    f.write(content)

