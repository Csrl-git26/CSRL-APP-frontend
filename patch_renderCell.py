import re

filepath = '../CSRL-APP-frontend/src/components/StudentDashboard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace headers
content = content.replace("M | AT. | AC.</div>", "M | AT. | AC. | RANK</div>")

# Replace renderCell logic
target_render_cell = r"""              const renderCell = \(v\) => \{
                const isAbsent = v\.mark === 'A' \|\| v\.mark === 'a' \|\| v\.mark === 'Absent';
                if \(isAbsent\) return 'Absent';
                if \(v\.mark === null \|\| v\.mark === undefined \|\| v\.mark === '—'\) \{
                  if \(v\.attempted != null\) \{
                    return `— \| \$\{v\.attempted\} \| \$\{v\.accuracy\}%`;
                  \}
                  return '—';
                \}
                const m = v\.mark;
                const at = v\.attempted != null \? v\.attempted : '—';
                const ac = v\.accuracy != null \? `\$\{v\.accuracy\}%` : '—';
                return `\$\{m\} \| \$\{at\} \| \$\{ac\}`;
              \};"""

new_render_cell = """              const renderCell = (v) => {
                const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
                if (isAbsent) return 'Absent';
                if (v.mark === null || v.mark === undefined || v.mark === '—') {
                  if (v.attempted != null) {
                    return `— | ${v.attempted} | ${v.accuracy}% | —`;
                  }
                  return '—';
                }
                const m = v.mark;
                const at = v.attempted != null ? v.attempted : '—';
                const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
                const rnk = v.rank != null ? v.rank : '—';
                return `${m} | ${at} | ${ac} | ${rnk}`;
              };"""

content = re.sub(target_render_cell, new_render_cell, content)

# We need to extract `rank` from row in `subScores.map`
target_subscores = r"""              const subScores = subjects\.map\(\(s\) => \{
                const mark = row\[s\];
                const attempted = row\[`\$\{s\}_Attempted`\];
                const accuracy = row\[`\$\{s\}_Accuracy`\];
                return \{ mark, attempted, accuracy \};
              \}\);
              const total  = row\.Total;
              const totalAttempted = row\.Total_Attempted;
              const totalAccuracy = row\.Total_Accuracy;"""

new_subscores = """              const subScores = subjects.map((s) => {
                const mark = row[s];
                const attempted = row[`${s}_Attempted`];
                const accuracy = row[`${s}_Accuracy`];
                const rank = row[`${s}_Rank`];
                return { mark, attempted, accuracy, rank };
              });
              const total  = row.Total;
              const totalAttempted = row.Total_Attempted;
              const totalAccuracy = row.Total_Accuracy;
              const totalRank = row.Total_Rank;"""

content = re.sub(target_subscores, new_subscores, content)

# Replace the total renderCell call
target_total_call = r"\{renderCell\(\{ mark: total, attempted: totalAttempted, accuracy: totalAccuracy \}\)\}"
new_total_call = "{renderCell({ mark: total, attempted: totalAttempted, accuracy: totalAccuracy, rank: totalRank })}"
content = content.replace(target_total_call, new_total_call)

with open(filepath, 'w') as f:
    f.write(content)
print('Patched frontend renderCell')
