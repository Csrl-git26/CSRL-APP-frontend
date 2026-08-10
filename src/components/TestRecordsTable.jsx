import React from 'react';

export default function TestRecordsTable({ chartData, streamCfg, stream, isCentre }) {
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
                  <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | RANK</div>
                </th>
              ))}
              <th>
                <div>Total</div>
                <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | RANK</div>
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
                
              const renderCell = (v) => {
                const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
                if (isAbsent) return 'Absent';
                if (v.mark === null || v.mark === undefined || v.mark === '—') {
                  if (v.attempted != null) {
                    return `— | ${v.attempted} | ${v.accuracy}% | —`;
                  }
                  return '—';
                }
                const m = Math.round(v.mark);
                const at = v.attempted != null ? v.attempted : '—';
                const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
                const rnk = v.rank != null ? v.rank : '—';
                return `${m} | ${at} | ${ac} | ${rnk}`;
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
                    <strong style={{ color: total === 'Absent' ? 'var(--red)' : '#1a4fa0' }}>
                      {renderCell({ mark: total, attempted: totalAttempted, accuracy: totalAccuracy, rank: totalRank })}
                    </strong>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
