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
        <p style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: 15 }}>{data.rank} {centerName === data.code ? centerName : `${centerName} (${data.code})`}</p>
        <p style={{ margin: '2px 0', color: 'var(--csrl-blue)', fontWeight: 700 }}>Avg Score: {data.avg}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-700)', fontWeight: 600 }}>Top Score: {data.top}</p>
        
        {data.qualRate !== undefined && <p style={{ margin: '2px 0', color: data.qualRate < 50 ? '#ef4444' : 'var(--gray-700)', fontWeight: data.qualRate < 50 ? 700 : 600 }}>Qual. Rate: {data.qualRate}%</p>}
        <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontWeight: 700 }}>Weakest: {data.weakSubject}</p>
        
        {data.notQualBySub && Object.keys(data.notQualBySub).length > 0 && (
          <div style={{ marginTop: 8, padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4, letterSpacing: 0.5 }}>No. of student subjectwise marks <=20</div>
            {Object.entries(data.notQualBySub).map(([subj, count]) => (
              <div key={subj} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ef4444', marginBottom: 2 }}>
                <span>{subj}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
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
    const { x, y, width, height, value, index } = props;
    const data = sortedStats[index];
    const isRedFlag = data && (data.avg < 100 || (data.qualRate ?? 0) < 50);
    const centerX = x + width / 2;

    const showInside = height > 70;
    const topY = showInside ? y + 25 : y - 25;
    const textColor = showInside ? "#ffffff" : "#1e293b";
    const subTextColor = showInside ? "#93c5fd" : "#0284c7";

    return (
      <g style={{ pointerEvents: 'none' }}>
        {isRedFlag && (
          <text x={centerX} y={topY - 4} fill="#ef4444" textAnchor="middle" fontSize={18} style={{ textShadow: showInside ? '0px 0px 4px rgba(255,255,255,0.8)' : 'none' }}>
            🚩
          </text>
        )}
        <text x={centerX} y={topY + (isRedFlag ? 12 : 0)} fill={textColor} textAnchor="middle" fontSize={15} fontWeight={900}>
          {value}
        </text>

      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 320, marginTop: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedStats}
          margin={{ top: 50, right: 30, left: 0, bottom: 5 }}
        >
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="code" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 14, fill: '#1e293b', fontWeight: 'bold' }} 
            interval={0}
            height={50}
            axisLine={false}
            tickLine={false}
          >
            
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
          <Bar isAnimationActive={false} 
            dataKey="avg" 
            radius={[4, 4, 0, 0]} 
            style={{ cursor: 'pointer' }} 
            fill="#1a4fa0"
            activeBar={{ fill: '#2563eb', stroke: '#93c5fd', strokeWidth: 2 }}
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
