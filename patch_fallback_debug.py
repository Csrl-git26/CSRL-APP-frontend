import re

filepath = '../CSRL-APP-backed/server.js'
with open(filepath, 'r') as f:
    content = f.read()

target = """            Object.keys(metrics).forEach(sub => {
              const outSub = sub === 'Mathematics' ? 'Math' : sub;
              row[`${outSub}_Attempted`] = metrics[sub].attempted;
              row[`${outSub}_Correct`] = metrics[sub].correct;
              if (metrics[sub].attempted > 0) {
                row[`${outSub}_Accuracy`] = Math.round((metrics[sub].correct / metrics[sub].attempted) * 100);
              }
            });"""

replacement = """            Object.keys(metrics).forEach(sub => {
              const outSub = sub === 'Mathematics' ? 'Math' : sub;
              row[`${outSub}_Attempted`] = metrics[sub].attempted;
              row[`${outSub}_Correct`] = metrics[sub].correct;
              if (metrics[sub].attempted > 0) {
                row[`${outSub}_Accuracy`] = Math.round((metrics[sub].correct / metrics[sub].attempted) * 100);
              } else {
                row[`${outSub}_Accuracy`] = 0;
              }
            });"""

content = content.replace(target, replacement)

target2 = """            if (totalAttempted > 0) {
              row['Total_Attempted'] = totalAttempted;
              row['Total_Correct'] = totalCorrect;
              row['Total_Accuracy'] = Math.round((totalCorrect / totalAttempted) * 100);
            }"""

replacement2 = """            row['Total_Attempted'] = totalAttempted;
            row['Total_Correct'] = totalCorrect;
            row['Total_Accuracy'] = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
            row['FALLBACK_DEBUG'] = 'RAN';"""

content = content.replace(target2, replacement2)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched debug successfully')
