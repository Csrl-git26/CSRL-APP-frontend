import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { getJeePercentile, getNeetScore } from '../services/dataService';

export default function StudentReportCard({
  profile,
  stream,
  chartData,
  subjects,
  overallWeakSubjects,
  overallWeakTopicsData,
  weakSubject,
  subjectColor,
  examResult,
  examLabel,
}) {
  if (!profile) return null;

  const schoolName = profile['10th SCHOOL NAME'] || profile['12th SCHOOL NAME'] || profile['10th SCHOOL'] || profile['12th SCHOOL'] || profile['SCHOOL NAME'] || profile.SCHOOL || '';
  const school10 = profile['10th SCHOOL NAME'] || schoolName;
  const school12 = profile['12th SCHOOL NAME'] || schoolName;

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '4px 0', fontSize: '11px' }}>
      <span style={{ width: '180px', color: '#64748b', fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, color: '#1e293b', fontWeight: 700 }}>{value && value !== ', ,  - ' ? value : '-'}</span>
    </div>
  );

  return (
    <>
    <div id="pdf-report-content" style={{
      width: '800px',
      background: 'white',
      padding: '24px',
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1a4fa0', paddingBottom: '8px', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1a4fa0', margin: 0, textTransform: 'uppercase' }}>
            CSRL Student Report
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1e293b' }}>{profile["STUDENT'S NAME"] || 'Unknown'}</h2>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            <span>Roll: {profile['ROLL NO.'] || profile.ROLL_KEY}</span>
            <span>Stream: {stream}</span>
            <span>Center: {profile.centerCode}</span>
          </div>
        </div>
      </div>

      {/* Weak Subjects Analysis */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ background: '#fff1f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #fda4af', paddingBottom: '4px' }}>
              Weak Subjects Analysis
            </h3>
            <InfoRow label="By Avg Score" value={weakSubject || 'N/A'} />
            <InfoRow label="By Accuracy" value={(() => {
              if (!overallWeakSubjects) return 'N/A';
              const weakest = [];
              Object.keys(overallWeakSubjects).forEach(sub => {
                if (overallWeakSubjects[sub]?.strongWeak?.length > 0) weakest.push(sub);
              });
              if (weakest.length === 0) {
                Object.keys(overallWeakSubjects).forEach(sub => {
                  if (overallWeakSubjects[sub]?.mediumWeak?.length > 0) weakest.push(`${sub} (Med)`);
                });
              }
              return weakest.length > 0 ? weakest.join(', ') : 'None Flagged';
            })()} />
          </div>
      </div>

      {/* FULL WIDTH: Performance Graph */}
      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
          Performance Trend & Records
        </h3>
        
        {chartData && chartData.length > 0 ? (
          <div style={{ width: '100%', height: '180px' }}>
            {/* IMPORTANT: Use explicit dimensions for html2canvas */}
            <ResponsiveContainer width={760} height={170}>
              <LineChart data={chartData} margin={{ top: 15, left: 0, bottom: 5, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 'dataMax']} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={30} />
                <Legend wrapperStyle={{ fontSize: 10, marginTop: '-5px' }} />
                {subjects.map(sub => (
                  <Line key={sub} type="monotone" dataKey={sub} stroke={subjectColor(sub)} strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} label={{ position: 'top', fill: subjectColor(sub), fontSize: 9, fontWeight: 600 }} />
                ))}
                <Line type="monotone" dataKey="Total" stroke="#1a4fa0" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} label={{ position: 'top', fill: '#1a4fa0', fontSize: 9, fontWeight: 700 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No performance data available</div>
        )}
      </div>

      {/* FULL WIDTH: Overall Weak Topics MOVED TO PAGE 2 */}

    </div>
    
    {/* PAGE 2: Performance Table */}
    <div id="pdf-report-page2" style={{
      width: '800px',
      background: 'white',
      padding: '24px',
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1a4fa0', paddingBottom: '8px', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1a4fa0', margin: 0, textTransform: 'uppercase' }}>
            CSRL Student Report (Page 2)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#1e293b' }}>{profile["STUDENT'S NAME"] || 'Unknown'}</h2>
        </div>
      </div>

<h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
        Performance Test Records
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
            <th style={{ padding: '10px 8px', fontWeight: 700, color: '#475569' }}>Test</th>
            {subjects.map((s) => (
              <th key={s} style={{ padding: '10px 8px', fontWeight: 700, color: '#475569' }}>
                <div>{s}</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC.</div>
              </th>
            ))}
            <th style={{ padding: '10px 8px', fontWeight: 700, color: '#475569' }}>
              <div>Total</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC.</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {chartData && chartData.map((row, idx) => {
            const renderCell = (v) => {
              const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
              if (isAbsent) return 'Absent';
              if (v.mark === null || v.mark === undefined || v.mark === '—') {
                if (v.attempted != null) return `— | ${v.attempted} | ${v.accuracy}%`;
                return '—';
              }
              const m = v.mark;
              const at = v.attempted != null ? v.attempted : '—';
              const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
              return `${m} | ${at} | ${ac}`;
            };

            return (
              <tr key={row.name} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '10px 8px', fontWeight: 700 }}>{row.name}</td>
                {subjects.map((s, i) => {
                  const mark = row[s];
                  const attempted = row[`${s}_Attempted`];
                  const accuracy = row[`${s}_Accuracy`];
                  const v = { mark, attempted, accuracy };
                  const isAbsent = mark === 'A' || mark === 'a' || mark === 'Absent';
                  const isEmpty = (mark === null || mark === undefined || mark === '—') && attempted == null;
                  return (
                    <td key={i} style={{ padding: '10px 8px', color: (isEmpty || isAbsent) ? '#94a3b8' : 'inherit', whiteSpace: 'nowrap' }}>
                      {renderCell(v)}
                    </td>
                  );
                })}
                <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: row.Total === 'Absent' ? '#c0392b' : '#1a4fa0' }}>
                    {renderCell({ mark: row.Total, attempted: row.Total_Attempted, accuracy: row.Total_Accuracy })}
                  </strong>
                </td>
              </tr>
            );
          })}
          {(!chartData || chartData.length === 0) && (
            <tr><td colSpan={subjects.length + 2} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No marks recorded yet.</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
        * Reference: M = Marks, AT. = Attempted Questions, AC. = Accuracy %
      </div>

      {/* FULL WIDTH: Overall Weak Topics */}
      {overallWeakTopicsData && overallWeakTopicsData.overallWeakTopics && Object.keys(overallWeakTopicsData.overallWeakTopics).length > 0 && (
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
            Detailed Weak Topics Analysis <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'none' }}>(Based on {overallWeakTopicsData.totalTests} tests)</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology'].map((subject) => {
              const subjData = overallWeakTopicsData.overallWeakTopics[subject];
              if (!subjData || (!subjData.strongWeak.length && !subjData.mediumWeak.length)) return null;
              
              const colors = {
                Physics:     { bg: '#e8f0fc', color: '#1a4fa0', border: '#bbd0f8' },
                Chemistry:   { bg: '#fff3e0', color: '#b45309', border: '#fcd5a0' },
                Mathematics: { bg: '#e6f5ed', color: '#1a6e3b', border: '#a8dfc0' },
                Biology:     { bg: '#f3e8ff', color: '#7c3aed', border: '#d8b4fe' },
                Botany:      { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
                Zoology:     { bg: '#cffafe', color: '#0891b2', border: '#67e8f9' },
              }[subject] || { bg: '#f5f5f5', color: '#333', border: '#ddd' };

              return (
                <div key={subject} style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '8px', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', paddingBottom: '4px', borderBottom: `2px solid ${colors.border}` }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.color }} />
                    <span style={{ fontWeight: 700, fontSize: '12px', color: colors.color }}>{subject}</span>
                  </div>
                  
                  {subjData.strongWeak.length > 0 && (
                    <div style={{ marginBottom: subjData.mediumWeak.length ? '6px' : '0' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', marginBottom: '2px' }}>🔴 Weakest</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {subjData.strongWeak.map(topic => (
                          <span key={topic} style={{ display: 'inline-block', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontWeight: 700, background: '#fdecea', color: '#c0392b', border: '1px solid #f5a5a5', margin: '1px 3px 1px 0' }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {subjData.mediumWeak.length > 0 && (
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '2px' }}>🟡 Weak</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {subjData.mediumWeak.map(topic => (
                          <span key={topic} style={{ display: 'inline-block', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontWeight: 700, background: '#fff8e1', color: '#b45309', border: '1px solid #fcd5a0', margin: '1px 3px 1px 0' }}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
    </>
  );
}
