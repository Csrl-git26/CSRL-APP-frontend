import re

with open('src/components/StudentProfileView.jsx', 'r') as f:
    content = f.read()

# 1. Update subject headers
content = content.replace(
    "<div>{s}</div>\n                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC.</div>",
    "<div>{s}</div>\n                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | RANK</div>"
)

# 2. Update Total header and add Qualification header
target2 = """              <th>
                <div>Total</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC.</div>
              </th>
            </tr>"""
replacement2 = """              <th>
                <div>Total</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | RANK</div>
              </th>
              <th>
                <div>Qualification</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>Status</div>
              </th>
            </tr>"""
content = content.replace(target2, replacement2)

# 3. Update subScores mapping
target3 = """              const subScores = subjects.map((s) => {
                const mark = row[s];
                const attempted = row[`${s}_Attempted`];
                const accuracy = row[`${s}_Accuracy`];
                return { mark, attempted, accuracy };
              });"""
replacement3 = """              const subScores = subjects.map((s) => {
                const mark = row[s];
                const attempted = row[`${s}_Attempted`];
                const accuracy = row[`${s}_Accuracy`];
                const rank = row[`${s}_Rank`];
                return { mark, attempted, accuracy, rank };
              });"""
content = content.replace(target3, replacement3)

# 4. Extract Total_Rank and add Qualification logic
target4 = """              const pct    = total != null && !Number.isNaN(Number(total))
                ? Math.round((Number(total) / maxTot) * 100)
                : 0;
                
              const renderCell = (v) => {"""
replacement4 = """              const totalRank = row.Total_Rank;
              const pct    = total != null && !Number.isNaN(Number(total))
                ? Math.round((Number(total) / maxTot) * 100)
                : 0;

              let isQualified = false;
              let qualText = "—";

              if (total != null && !Number.isNaN(Number(total))) {
                const tot = Number(total);
                const p = Number(row.Physics || 0);
                const c = Number(row.Chemistry || 0);
                const m = Number(row.Math || 0);
                const b = Number(row.Biology || 0);

                if (stream === 'JEE') {
                  if (tot >= 120 && p >= 35 && c >= 35 && m >= 35) {
                    isQualified = true;
                  }
                } else if (stream === 'NEET') {
                  if (tot >= 550 && b >= 126 && p >= 63 && c >= 63) {
                    isQualified = true;
                  }
                }
                
                if (tot > 0 || total === 0) {
                  qualText = isQualified 
                    ? <span className="badge badge-success" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>Qualified</span> 
                    : <span className="badge badge-danger" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>Not Qualified</span>;
                }
              }
                
              const renderCell = (v) => {"""
content = content.replace(target4, replacement4)

# 5. Update renderCell
target5 = """                if (v.mark === null || v.mark === undefined || v.mark === '—') {
                  if (v.attempted != null) {
                    return `— | ${v.attempted} | ${v.accuracy}%`;
                  }
                  return '—';
                }
                const m = v.mark;
                const at = v.attempted != null ? v.attempted : '—';
                const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
                return `${m} | ${at} | ${ac}`;
              };"""
replacement5 = """                if (v.mark === null || v.mark === undefined || v.mark === '—') {
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
content = content.replace(target5, replacement5)

# 6. Update Total cell and add Qualification cell
target6 = """                  <td>
                    {renderCell({ mark: total, attempted: totalAttempted, accuracy: totalAccuracy })}
                  </td>
                </tr>"""
replacement6 = """                  <td>
                    {renderCell({ mark: total, attempted: totalAttempted, accuracy: totalAccuracy, rank: totalRank })}
                  </td>
                  <td>
                    {qualText}
                  </td>
                </tr>"""
content = content.replace(target6, replacement6)

with open('src/components/StudentProfileView.jsx', 'w') as f:
    f.write(content)
print("Patched frontend")
