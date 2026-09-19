import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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
  containerId = "pdf-report-content",
}) {
  if (!profile) return null;

  const schoolName = profile['10th SCHOOL NAME'] || profile['12th SCHOOL NAME'] || profile['10th SCHOOL'] || profile['12th SCHOOL'] || profile['SCHOOL NAME'] || profile.SCHOOL || '';
  const school10 = profile['10th SCHOOL NAME'] || schoolName;
  const school12 = profile['12th SCHOOL NAME'] || schoolName;

  const InfoRow = ({ label, value }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '4px 0', fontSize: '9px' }}>
      <span style={{ width: '180px', color: '#64748b', fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, color: '#1e293b', fontWeight: 700 }}>{value && value !== ', ,  - ' ? value : '-'}</span>
    </div>
  );

  return (
    <>
    <div id={containerId} style={{
      width: '800px',
      background: 'white',
      padding: '16px',
      color: '#0f172a',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #1a4fa0', paddingBottom: '8px', marginBottom: '8px' }}>
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
      <div style={{ marginBottom: '8px' }}>
        <div style={{ background: '#fff1f2', padding: '8px', borderRadius: '8px', border: '1px solid #fecdd3' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #fda4af', paddingBottom: '4px' }}>
              Weak Subjects Analysis
            </h3>
            <InfoRow label="By Avg Score" value={weakSubject || 'N/A'} />
            <InfoRow label="By Accuracy" value={(() => {
if (!overallWeakTopicsData || !overallWeakTopicsData.subjectWise) return 'N/A';
const subjectWise = overallWeakTopicsData.subjectWise;

let maxCount = 0;
let weakestSub = null;

// 1. Find subject with highest number of weak topics
Object.keys(subjectWise).forEach(sub => {
const count = subjectWise[sub]?.weak?.length || 0;
if (count > maxCount) {
maxCount = count;
weakestSub = sub;
}
});

// 2. If no weak topics, find subject with highest number of moderate topics
let isMed = false;
if (!weakestSub) {
Object.keys(subjectWise).forEach(sub => {
const count = subjectWise[sub]?.moderate?.length || 0;
if (count > maxCount) {
maxCount = count;
weakestSub = sub;
isMed = true;
}
});
}

if (!weakestSub) return 'None Flagged';

let formatSub = weakestSub.charAt(0) + weakestSub.slice(1).toLowerCase();
if (formatSub === 'Mathematics') formatSub = 'Math';

return formatSub + (isMed ? ' (Med)' : '');
})()} />
          </div>
      </div>

      {/* FULL WIDTH: Performance Graphs */}
      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
          Performance Trends
        </h3>
        
        {chartData && chartData.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {['MARKS', 'ATTEMPTED', 'ACCURACY', 'RANK'].map(metric => {
              const titles = { MARKS: 'Marks', ATTEMPTED: 'Attempted', ACCURACY: 'Accuracy (%)', RANK: 'Rank' };
              const isRank = metric === 'RANK';
              const isAcc = metric === 'ACCURACY';
              
              return (
                <div key={metric} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#475569', marginBottom: '4px', textAlign: 'center', textTransform: 'uppercase' }}>{titles[metric]} Trend</div>
                  <div style={{ width: '100%', height: '70px' }}>
                    <LineChart width={358} height={70} data={chartData} margin={{ top: 5, left: 0, bottom: -5, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis reversed={isRank} domain={isRank ? [1, 'dataMax'] : [0, 'dataMax']} tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} width={25} />
                        {subjects.map(sub => {
                          let dataKey = sub;
                          if (metric === 'ATTEMPTED') dataKey = `${sub}_Attempted`;
                          if (metric === 'ACCURACY') dataKey = `${sub}_Accuracy`;
                          if (metric === 'RANK') dataKey = `${sub}_Rank`;
                          return (
                            <Line key={sub} type="monotone" dataKey={dataKey} stroke={subjectColor(sub)} strokeWidth={1.5} dot={{ r: 1.5 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
                          );
                        })}
                        <Line type="monotone" dataKey={metric === 'MARKS' ? 'Total' : `Total_${metric.charAt(0).toUpperCase() + metric.slice(1).toLowerCase()}`} stroke="#1a4fa0" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" />
                      </LineChart>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No performance data available</div>
        )}
      </div>



<h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
        Performance Test Records
      </h3>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
            <th style={{ padding: '6px 6px', fontWeight: 700, color: '#475569' }}>Test</th>
            {subjects.map((s) => (
              <th key={s} style={{ padding: '6px 6px', fontWeight: 700, color: '#475569' }}>
                <div>{s}</div>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | Rk.</div>
              </th>
            ))}
            <th style={{ padding: '6px 6px', fontWeight: 700, color: '#475569' }}>
              <div>Total</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 'normal', marginTop: 2 }}>M | AT. | AC. | Rk.</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {chartData && chartData.map((row, idx) => {
            const renderCell = (v) => {
              const isAbsent = v.mark === 'A' || v.mark === 'a' || v.mark === 'Absent';
              if (isAbsent) return 'Absent';
              if (v.mark === null || v.mark === undefined || v.mark === '—') {
                if (v.attempted != null) return `— | ${v.attempted} | ${v.accuracy}% | ${v.rank || '—'}`;
                return '—';
              }
              const m = v.mark;
              const at = v.attempted != null ? v.attempted : '—';
              const ac = v.accuracy != null ? `${v.accuracy}%` : '—';
              const rk = v.rank != null ? v.rank : '—';
              return `${m} | ${at} | ${ac} | ${rk}`;
            };

            return (
              <tr key={row.name} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                <td style={{ padding: '6px 6px', fontWeight: 700 }}>{row.name}</td>
                {subjects.map((s, i) => {
                  const mark = row[s];
                  const attempted = row[`${s}_Attempted`];
                  const accuracy = row[`${s}_Accuracy`];
                  const rank = row[`${s}_Rank`];
                  const v = { mark, attempted, accuracy, rank };
                  const isAbsent = mark === 'A' || mark === 'a' || mark === 'Absent';
                  const isEmpty = (mark === null || mark === undefined || mark === '—') && attempted == null;
                  return (
                    <td key={i} style={{ padding: '6px 6px', color: (isEmpty || isAbsent) ? '#94a3b8' : 'inherit', whiteSpace: 'nowrap' }}>
                      {renderCell(v)}
                    </td>
                  );
                })}
                <td style={{ padding: '6px 6px', whiteSpace: 'nowrap' }}>
                  <strong style={{ color: row.Total === 'Absent' ? '#c0392b' : '#1a4fa0' }}>
                    {renderCell({ mark: row.Total, attempted: row.Total_Attempted, accuracy: row.Total_Accuracy, rank: row.Total_Rank })}
                  </strong>
                </td>
              </tr>
            );
          })}
          {(!chartData || chartData.length === 0) && (
            <tr><td colSpan={subjects.length + 2} style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>No marks recorded yet.</td></tr>
          )}
        </tbody>
      </table>
      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '12px', fontStyle: 'italic' }}>
        * Reference: M = Marks, AT. = Attempted Questions, AC. = Accuracy %, Rk. = Rank
      </div>

      {/* FULL WIDTH: Overall Weak Topics */}
      {overallWeakTopicsData && overallWeakTopicsData.subjectWise && Object.keys(overallWeakTopicsData.subjectWise).length > 0 && (
        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
            Overall Topic Performance <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, textTransform: 'none' }}>(Based on {overallWeakTopicsData.totalTests} tests)</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['Physics', 'Chemistry', 'Mathematics', 'Botany', 'Zoology'].map((subject) => {
              const subjKey = subject.toUpperCase();
              const subjData = overallWeakTopicsData.subjectWise[subjKey] || {};
              
              const strongArr = Array.isArray(subjData.strong) ? subjData.strong : [];
              const modArr = Array.isArray(subjData.moderate) ? subjData.moderate : [];
              const weakArr = Array.isArray(subjData.weak) ? subjData.weak : [];
              if (!subjData || (!strongArr.length && !modArr.length && !weakArr.length)) return null;

              
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
                  
                  {strongArr.length > 0 && (
                    <div style={{ marginBottom: (modArr.length || weakArr.length) ? '6px' : '0' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '2px' }}>🟢 Strong</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {strongArr.map((t, idx) => {
                          const topicName = typeof t === 'object' && t ? (t.topic || 'Unknown') : String(t);
                          return (
                          <span key={idx} style={{ display: 'inline-block', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', margin: '1px 3px 1px 0' }}>
                            {topicName}
                          </span>
                        )})}
                      </div>
                    </div>
                  )}

                  {modArr.length > 0 && (
                    <div style={{ marginBottom: weakArr.length ? '6px' : '0' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '2px' }}>🟡 Moderate</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {modArr.map((t, idx) => {
                          const topicName = typeof t === 'object' && t ? (t.topic || 'Unknown') : String(t);
                          return (
                          <span key={idx} style={{ display: 'inline-block', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontWeight: 700, background: '#fff8e1', color: '#b45309', border: '1px solid #fcd5a0', margin: '1px 3px 1px 0' }}>
                            {topicName}
                          </span>
                        )})}
                      </div>
                    </div>
                  )}

                  {weakArr.length > 0 && (
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#c0392b', textTransform: 'uppercase', marginBottom: '2px' }}>🔴 Weak</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {weakArr.map((t, idx) => {
                          const topicName = typeof t === 'object' && t ? (t.topic || 'Unknown') : String(t);
                          return (
                          <span key={idx} style={{ display: 'inline-block', padding: '1px 4px', borderRadius: '3px', fontSize: '8.5px', fontWeight: 700, background: '#fdecea', color: '#c0392b', border: '1px solid #f5a5a5', margin: '1px 3px 1px 0' }}>
                            {topicName}
                          </span>
                        )})}
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
