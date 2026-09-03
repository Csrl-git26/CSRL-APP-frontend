import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMaxMarksForSubject } from '../services/dataService';

const SUBJECT_COLORS = ['#6366f1', '#f97316', '#10b981', '#f43f5e'];

export default function PerformanceChart({ chartData, streamCfg, noCard, height = 350 }) {
  const [chartMetric, setChartMetric] = useState('MARKS');
  const [chartSubjects, setChartSubjects] = useState(['Physics', 'Chemistry', 'Math', 'Biology', 'Total']);

  const subjects = streamCfg.subjects.filter((sub) => chartData.some((row) => 
    row[sub] !== undefined && row[sub] !== null
  ));

  return (
    <div className={noCard ? "" : "card"} style={{ marginBottom: noCard ? 0 : '24px' }}>
      {!noCard && <div className="section-title">📈 Performance Trend</div>}
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          {['MARKS', 'ACCURACY', 'ATTEMPTED', 'CORRECT', 'RANK'].map((m) => (
            <button
              key={m}
              onClick={() => setChartMetric(m)}
              style={{
                padding: '4px 10px', borderRadius: 999, border: '1px solid',
                borderColor: chartMetric === m ? 'var(--csrl-orange)' : 'var(--gray-200)',
                background: chartMetric === m ? 'var(--csrl-orange)' : '#f8fafc',
                color: chartMetric === m ? '#fff' : 'var(--gray-600)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: '0.2s'
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid var(--gray-100)' }}>
          {[...subjects, 'Total'].map((sub, i) => (
            <label key={sub} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 600, color: 'var(--gray-700)' }}>
              <input
                type="checkbox"
                checked={chartSubjects.includes(sub)}
                onChange={(e) => {
                  if (e.target.checked) setChartSubjects([...chartSubjects, sub]);
                  else setChartSubjects(chartSubjects.filter(s => s !== sub));
                }}
                style={{ accentColor: sub === 'Total' ? '#8b5cf6' : SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
              />
              {sub}
            </label>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 15, right: 15, left: 0, bottom: 70 }}>
            <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#e2e8f020" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--gray-700)', fontWeight: 700 }} interval={0} angle={-35} textAnchor="end" />
            <YAxis reversed={chartMetric === 'RANK'} domain={chartMetric === 'RANK' ? [1, 'dataMax'] : [0, 'dataMax']} axisLine={{ stroke: 'var(--gray-300)' }} tickLine={false} tick={{ fill: 'var(--gray-500)', fontSize: 11 }} width={35} />
            <Tooltip
              formatter={(value, name) => {
                const isTotal = name.startsWith('Total');
                const subName = isTotal ? 'Total' : name.split('_')[0];
                if (chartMetric === 'MARKS') return [value ?? '—', isTotal ? `Total / ${streamCfg.maxTotal}` : `${subName} / ${getMaxMarksForSubject(streamCfg, subName)}`];
                if (chartMetric === 'ACCURACY') return [value !== undefined && value !== null ? `${value}%` : '—', `${subName} Accuracy`];
                if (chartMetric === 'ATTEMPTED') return [value ?? '—', `${subName} Attempted`];
                if (chartMetric === 'CORRECT') return [value ?? '—', `${subName} Correct`];
                if (chartMetric === 'RANK') return [value ?? '—', `${subName} Rank`];
                return [value ?? '—', name];
              }}
              contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 30 }} />
            {subjects.map((sub, i) => {
              if (!chartSubjects.includes(sub)) return null;
              let dataKey = sub;
              if (chartMetric === 'ACCURACY') dataKey = `${sub}_Accuracy`;
              if (chartMetric === 'ATTEMPTED') dataKey = `${sub}_Attempted`;
              if (chartMetric === 'CORRECT') dataKey = `${sub}_Correct`;
              if (chartMetric === 'RANK') dataKey = `${sub}_Rank`;

              return (
                <Line
                  key={sub}
                  name={sub}
                  type="monotone"
                  dataKey={dataKey}
                  stroke={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                  strokeWidth={1.8}
                  dot={{ r: 3, strokeWidth: 1.5, fill: '#fff', stroke: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                  activeDot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }}
                  connectNulls
                  isAnimationActive={true}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                  label={{ position: 'top', fill: SUBJECT_COLORS[i % SUBJECT_COLORS.length], fontSize: 10, fontWeight: 700, formatter: (val) => chartMetric === 'ACCURACY' && val !== null && val !== undefined ? `${val}%` : val }}
                />
              );
            })}
            {chartSubjects.includes('Total') && (
              <Line
                name="Total"
                type="monotone"
                dataKey={chartMetric === 'MARKS' ? 'Total' : (chartMetric === 'RANK' ? 'Total_Rank' : `Total_${chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1).toLowerCase()}`)}
                stroke="#8b5cf6"
                strokeWidth={2.2}
                dot={{ r: 3.5, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#8b5cf6' }}
                connectNulls
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-in-out"
                label={{ position: 'top', fill: '#8b5cf6', fontSize: 10, fontWeight: 700, formatter: (val) => chartMetric === 'ACCURACY' && val !== null && val !== undefined ? `${val}%` : val }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
