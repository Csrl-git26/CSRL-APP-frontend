import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { CENTERS } from '../config/centers';

function getGradientColor(index, total) {
  if (total <= 1) return '#1a4fa0';
  const factor = index / (total - 1);
  const r = Math.round(26 + factor * (220 - 26));
  const g = Math.round(79 + factor * (20 - 79));
  const b = Math.round(160 + factor * (20 - 160));
  return `rgb(${r}, ${g}, ${b})`;
}

const Empty = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
    <BarChart2 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
    <div style={{ fontWeight: 600 }}>{message}</div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const centerName = CENTERS[data.code]?.name || data.code;
    return (
      <div style={{ background: '#fff', border: '1px solid #ccc', padding: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13, zIndex: 100 }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: 14 }}>#{data.rank} {centerName} ({data.code})</p>
        <p style={{ margin: '2px 0', color: 'var(--csrl-blue)', fontWeight: 600 }}>Avg Score: {data.avg}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-600)' }}>Top Score: {data.top}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-600)' }}>Tested: {data.tested}/{data.studentCount}</p>
        <p style={{ margin: '8px 0 0 0', color: 'var(--red-600)', fontWeight: 600 }}>Weakest: {data.weakSubject}</p>
      </div>
    );
  }
  return null;
};

export default function CentreLeaderboard({ centreStats = [], selTest, onCentreClick }) {
  if (!selTest) return <Empty message="Select a test to view rankings" />;
  if (!centreStats.length) return <Empty message={`No test data for ${selTest}`} />;

  // Sort by rank ascending to ensure the highest rank is first (leftmost)
  const sortedStats = [...centreStats].sort((a, b) => a.rank - b.rank);

  return (
    <div style={{ width: '100%', height: 500, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedStats}
          margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          onClick={(data) => {
             if (data && data.activePayload && typeof onCentreClick === 'function') {
               onCentreClick(data.activePayload[0].payload.code);
             }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="code" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            interval={0}
            height={60}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="avg" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }}>
            {sortedStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGradientColor(index, sortedStats.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
