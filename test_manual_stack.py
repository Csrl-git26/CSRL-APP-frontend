import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update data mapping
old_mapping = """                   if (s.rawScores) {
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
                             d[sub] = val;
                          }
                      });
                   }"""

new_mapping = """                   let posSum = 0;
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
content = content.replace(old_mapping, new_mapping)

# 2. Update BarChart to remove stackId, add barGap="-100%", and use _val for LabelList
old_barchart_start = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>'
new_barchart_start = '<BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 20, left: 5, bottom: 5 }} barGap="-100%">'
content = content.replace(old_barchart_start, new_barchart_start)

# Replace all <Bar ... stackId="a" ...> with <Bar ...> and LabelList dataKey
content = content.replace('stackId="a" ', '')
content = content.replace('dataKey="Physics"', 'dataKey="Physics_val"')
content = content.replace('dataKey="Chemistry"', 'dataKey="Chemistry_val"')
content = content.replace('dataKey="Math"', 'dataKey="Math_val"')
content = content.replace('dataKey="Mathematics"', 'dataKey="Mathematics_val"')
content = content.replace('dataKey="Biology"', 'dataKey="Biology_val"')
content = content.replace('dataKey="Botany"', 'dataKey="Botany_val"')
content = content.replace('dataKey="Zoology"', 'dataKey="Zoology_val"')

# Restore Bar dataKeys to the array keys (removing _val from the Bar dataKey itself)
content = content.replace('<Bar dataKey="Physics_val" fill="#3b82f6" barSize={24}>', '<Bar dataKey="Physics" fill="#3b82f6" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Chemistry_val" fill="#8b5cf6">', '<Bar dataKey="Chemistry" fill="#8b5cf6" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Math_val" fill="#0ea5e9">', '<Bar dataKey="Math" fill="#0ea5e9" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Mathematics_val" fill="#0ea5e9">', '<Bar dataKey="Mathematics" fill="#0ea5e9" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Biology_val" fill="#ec4899">', '<Bar dataKey="Biology" fill="#ec4899" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Botany_val" fill="#14b8a6">', '<Bar dataKey="Botany" fill="#14b8a6" barSize={24} isAnimationActive={false}>')
content = content.replace('<Bar dataKey="Zoology_val" fill="#f59e0b">', '<Bar dataKey="Zoology" fill="#f59e0b" barSize={24} isAnimationActive={false}>')


with open(file_path, 'w') as f:
    f.write(content)

