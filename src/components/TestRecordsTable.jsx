import React from 'react';

export default function TestRecordsTable({ chartData, streamCfg, stream, isCentre, profile }) {
  const subjects = streamCfg.subjects.filter((sub) => chartData.some((row) => 
    row[sub] !== undefined && row[sub] !== null
  ));

  return (
    <div className="card">
      <div className="section-title">📋 Complete Test Records</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Test</th>
              {streamCfg.subjects.map((s) => (
                <th key={s}>
                  <div>{s}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>
                    M | AT. | AC. | RANK
                  </div>
                </th>
              ))}
              <th>
                <div>Total</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>
                  M | AT. | AC. | RANK
                </div>
              </th>
              <th>
                <div>Qualification</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>Status</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => {
              const subScores = subjects.map((s) => {
                const mark = row[s];
                const attempted = row[`${s}_Attempted`];
                const accuracy = row[`${s}_Accuracy`];
                const rank = row[`${s}_Rank`];
                return { mark, attempted, accuracy, rank };
              });
              const total  = row.Total;
              const totalAttempted = row.Total_Attempted;
              const totalAccuracy = row.Total_Accuracy;
              const maxTot = streamCfg.maxTotal;
              const totalRank = row.Total_Rank;

              let isQualified = false;
              let qualText = "—";

              if (isCentre) {
                if (row.qualRate != null) {
                  qualText = (
                    <span className="badge badge-success" style={{ background: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}>
                      {row.qualRate}% Qualified
                    </span>
                  );
                }
              } else if (total != null && !Number.isNaN(Number(total))) {
                const tot = Number(total);
                const p = Number(row.Physics || 0);
                const c = Number(row.Chemistry || 0);
                const m = Number(row.Math || 0);
                const b = Number(row.Biology || 0);

                if (stream === 'JEE') {
                  const cat = (profile?.CATEGORY || '').toUpperCase().trim();
                  let overallMin = 110;
                  if (cat.includes('PWD')) overallMin = 30;
                  else if (cat.includes('ST')) overallMin = 60;
                  else if (cat.includes('SC')) overallMin = 65;
                  else if (cat.includes('OBC')) overallMin = 85;
                  else if (cat.includes('EWS')) overallMin = 90;
                  
                  if (tot >= overallMin) {
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
                
              const renderCell = (v) => {
                const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
                if (isAbsent) return <strong style={{ fontSize: '1.1em', color: 'var(--red)' }}>Absent</strong>;
                if (v.mark === null || v.mark === undefined || v.mark === '—') {
                  if (v.attempted != null) {
                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <strong style={{ fontSize: '1.1em', color: 'var(--gray-500)' }}>—</strong>
                        <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                        <span style={{ color: 'var(--gray-600)' }}>{v.attempted}</span>
                        <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                        <span style={{ color: 'var(--gray-600)' }}>{v.accuracy != null ? v.accuracy + '%' : '—'}</span>
                        <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                        <span style={{ color: 'var(--gray-600)' }}>—</span>
                      </span>
                    );
                  }
                  return <strong style={{ fontSize: '1.1em', color: 'var(--gray-400)' }}>—</strong>;
                }
                const m = Math.round(v.mark);
                const at = v.attempted != null ? v.attempted : '—';
                const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
                const rnk = v.rank != null ? v.rank : '—';
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <strong style={{ fontSize: '1.1em', color: 'var(--csrl-blue)' }}>{m}</strong>
                    <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                    <span style={{ color: 'var(--gray-600)' }}>{at}</span>
                    <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                    <span style={{ color: 'var(--gray-600)' }}>{ac}</span>
                    <span style={{ color: 'var(--gray-300)', padding: '0 2px' }}>|</span>
                    <span style={{ color: 'var(--gray-600)' }}>{rnk}</span>
                  </span>
                );
              };

              return (
                <tr key={row.name}>
                  <td><strong>{row.name}</strong></td>
                  {subScores.map((v, i) => {
                    const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
                    const isEmpty = (v.mark === null || v.mark === undefined || v.mark === '—') && v.attempted == null;
                    return (
                      <td key={i} style={{ color: (isEmpty || isAbsent) ? 'var(--gray-300)' : 'inherit', whiteSpace: 'nowrap' }}>
                        {renderCell(v)}
                      </td>
                    );
                  })}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ color: total === 'Absent' ? 'var(--red)' : '#1a4fa0' }}>
                      {renderCell({ mark: total, attempted: totalAttempted, accuracy: totalAccuracy, rank: totalRank })}
                    </div>
                  </td>
                  <td>
                    {qualText}
                  </td>
                </tr>
              );
            })}
            {!chartData.length && (
              <tr><td colSpan={streamCfg.subjects.length + 3} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No marks recorded yet.</td></tr>
            )}
            {chartData.length > 0 && (() => {
              const calculateSubjectStats = (subject) => {
                let sum = 0;
                let count = 0;
                let fails = 0;
                
                let threshold = 35;
                if (stream === 'NEET') {
                  threshold = (subject === 'Biology' || subject === 'Botany' || subject === 'Zoology') ? 126 : 63;
                }

                chartData.forEach(row => {
                  const val = row[subject];
                  if (val !== undefined && val !== null && val !== 'Absent' && val !== 'a' && val !== 'A' && val !== '—') {
                    const num = Number(val);
                    if (!isNaN(num)) {
                      sum += num;
                      count++;
                      if (num < threshold) fails++;
                    }
                  }
                });

                return {
                  avg: count > 0 ? Math.round(sum / count) : '—',
                  fails
                };
              };

              const totalStats = (() => {
                let sum = 0;
                let count = 0;
                let fails = 0;
                let threshold = stream === 'NEET' ? 550 : 120;
                
                chartData.forEach(row => {
                  const val = row.Total;
                  if (val !== undefined && val !== null && val !== 'Absent' && val !== 'a' && val !== 'A' && val !== '—') {
                    const num = Number(val);
                    if (!isNaN(num)) {
                      sum += num;
                      count++;
                      if (num < threshold) fails++;
                    }
                  }
                });
                
                return {
                  avg: count > 0 ? Math.round(sum / count) : '—',
                  fails
                };
              })();

              return (
                <tr style={{ background: 'var(--gray-50)', borderTop: '2px solid var(--gray-200)' }}>
                  <td style={{ fontWeight: 800, color: 'var(--gray-800)' }}>
                    <div>Overall Average</div>
                    {!isCentre && <div style={{ fontSize: 10, color: '#991b1b', marginTop: 4 }}>No. of student subjectwise marks &lt;=20</div>}
                  </td>
                  {subjects.map(s => {
                    const stats = calculateSubjectStats(s);
                    return (
                      <td key={s}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700, color: 'var(--csrl-blue)', fontSize: '1.1em' }}>{stats.avg}</span>
                          {!isCentre && stats.fails > 0 && (
                            <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>{stats.fails} times</span>
                          )}
                          {!isCentre && stats.fails === 0 && stats.avg !== '—' && (
                            <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>0 times</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 800, color: '#1a4fa0', fontSize: '1.1em' }}>{totalStats.avg}</span>
                      {!isCentre && totalStats.fails > 0 && (
                        <span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>{totalStats.fails} times</span>
                      )}
                      {!isCentre && totalStats.fails === 0 && totalStats.avg !== '—' && (
                        <span style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>0 times</span>
                      )}
                    </div>
                  </td>
                  <td></td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '8px 16px', fontSize: 11, color: 'var(--gray-500)', marginTop: 4 }}>
        <em>* Reference: M = Marks, AT. = Attempted Questions, AC. = Accuracy %, RANK = {isCentre ? "Centre's Rank" : "Student's Rank"}</em>
      </div>
    </div>
  );
}
