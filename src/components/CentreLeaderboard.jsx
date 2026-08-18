import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Label } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { CENTERS } from '../config/centers';

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
    const isRedFlag = data.avg < 100 || (data.qualRate ?? 0) < 50;

    return (
      <div style={{ background: '#fff', border: isRedFlag ? '2px solid #fca5a5' : '1px solid #ccc', padding: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13, zIndex: 100 }}>
        {isRedFlag && <div style={{ color: '#ef4444', fontWeight: 800, marginBottom: 4 }}>🚩 ACTION REQUIRED</div>}
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', fontSize: 14 }}>#{data.rank} {centerName} ({data.code})</p>
        <p style={{ margin: '2px 0', color: 'var(--csrl-blue)', fontWeight: 600 }}>Avg Score: {data.avg}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-600)' }}>Top Score: {data.top}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-600)' }}>Tested: {data.tested}/{data.studentCount}</p>
        {data.qualRate !== undefined && <p style={{ margin: '2px 0', color: 'var(--gray-600)' }}>Qual. Rate: {data.qualRate}%</p>}
        <p style={{ margin: '8px 0 0 0', color: 'var(--red-600)', fontWeight: 600 }}>Weakest: {data.weakSubject}</p>
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #eee', fontSize: 11, color: '#3b82f6', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>
          🖱️ Click column for full overview
        </div>
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

  const renderCustomBarLabel = (props) => {
    const { x, y, width, value, index } = props;
    const data = sortedStats[index];
    const isRedFlag = data && (data.avg < 100 || (data.qualRate ?? 0) < 50);

    return (
      <g>
        <text x={x + width / 2} y={y - 18} fill="#1e293b" textAnchor="middle" fontSize={13} fontWeight={900}>
          {value}
        </text>
        <text x={x + width / 2} y={y - 6} fill="#0284c7" textAnchor="middle" fontSize={9} fontWeight={800} style={{ pointerEvents: 'none' }}>
          CLICK
        </text>
        {isRedFlag && (
          <text x={x + width / 2} y={y - 34} fill="#ef4444" textAnchor="middle" fontSize={14}>
            🚩
          </text>
        )}
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 500, marginTop: 16 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedStats}
          margin={{ top: 50, right: 30, left: 0, bottom: 60 }}
        >
          <defs>
            <linearGradient id="crystalWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={0.9}/>
              <stop offset="25%" stopColor="#38bdf8" stopOpacity={1}/>
              <stop offset="50%" stopColor="#e0f2fe" stopOpacity={0.95}/>
              <stop offset="75%" stopColor="#0ea5e9" stopOpacity={1}/>
              <stop offset="100%" stopColor="#0369a1" stopOpacity={0.9}/>
            </linearGradient>
            <linearGradient id="crystalWaterActive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1}/>
              <stop offset="25%" stopColor="#7dd3fc" stopOpacity={1}/>
              <stop offset="50%" stopColor="#ffffff" stopOpacity={1}/>
              <stop offset="75%" stopColor="#38bdf8" stopOpacity={1}/>
              <stop offset="100%" stopColor="#0284c7" stopOpacity={1}/>
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="code" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 14, fill: '#1e293b', fontWeight: 'bold' }} 
            interval={0}
            height={80}
            axisLine={false}
            tickLine={false}
          >
            <Label value="Centre" offset={10} position="insideBottom" style={{ fontSize: 16, fontWeight: 'bold', fill: '#64748b' }} />
          </XAxis>
          <YAxis 
            tick={{ fontSize: 14, fill: '#1e293b', fontWeight: 'bold' }} 
            axisLine={false}
            tickLine={false}
            width={70}
          >
            <Label value="Average Score" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 16, fontWeight: 'bold', fill: '#64748b' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar 
            dataKey="avg" 
            radius={[6, 6, 0, 0]} 
            style={{ cursor: 'pointer', filter: 'url(#shadow)' }} 
            fill="url(#crystalWater)"
            activeBar={{ fill: 'url(#crystalWaterActive)', stroke: '#ffffff', strokeWidth: 1 }}
            onClick={(data) => {
              if (data && data.code && typeof onCentreClick === 'function') {
                onCentreClick(data.code);
              }
            }}
          >
            <LabelList dataKey="avg" content={renderCustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
