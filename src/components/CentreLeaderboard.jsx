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

const CustomTooltip = ({ active, payload, selectedSubject }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const centerName = CENTERS[data.code]?.name || data.code;
    
    let isRedFlag = false;
    if (selectedSubject === 'Total' || !selectedSubject) {
      isRedFlag = data.avg < 100 || (data.qualRate ?? 0) < 80;
    } else if (selectedSubject === 'Qualification') {
      isRedFlag = (data.qualRate ?? 0) < 80;
    } else {
      isRedFlag = data.avg <= 20;
    }


    return (
      <div style={{ background: '#fff', border: isRedFlag ? '2px solid #fca5a5' : '1px solid #ccc', padding: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13, zIndex: 100 }}>
        {isRedFlag && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#cc0000', animation: 'csrlPulse 1.2s ease-out infinite', boxShadow: '0 0 0 0 rgba(220,0,0,1)', flexShrink: 0, border: '2px solid #ff0000' }} /><span style={{ color: '#ef4444', fontWeight: 800, letterSpacing: 0.5 }}>⚠ ACTION REQUIRED</span></div>)}
        <p style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: 15 }}>{data.rank} {centerName === data.code ? centerName : `${centerName} (${data.code})`}</p>
        <p style={{ margin: '2px 0', color: 'var(--csrl-blue)', fontWeight: 700 }}>Avg Score: {data.avg}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-700)', fontWeight: 600 }}>Highest Individual Score: {data.top}</p>
        {data.bottom !== undefined && <p style={{ margin: '2px 0', color: 'var(--gray-700)', fontWeight: 600 }}>Lowest Individual Score: {data.bottom}</p>}
        
        {(!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification') && data.qualRate !== undefined && <p style={{ margin: '2px 0', color: data.qualRate < 80 ? '#ef4444' : 'var(--gray-700)', fontWeight: data.qualRate < 80 ? 700 : 600 }}>Qual. Rate: {Math.round(data.qualRate)}%</p>}
        {(!selectedSubject || selectedSubject === 'Total') && <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontWeight: 700 }}>Weakest: {data.weakSubject}</p>}
        
        {(() => {
          if (!data.notQualBySub) return null;
          const entries = Object.entries(data.notQualBySub).filter(([subj]) => {
            if (!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification') return true;
            return subj === selectedSubject;
          });
          if (entries.length === 0) return null;
          
          const title = (!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification')
            ? "No. of student subjectwise marks <=20"
            : `No. of student marks in ${selectedSubject} <=20`;
            
          return (
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4, letterSpacing: 0.5 }}>{title}</div>
              {entries.map(([subj, count]) => (
                <div key={subj} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ef4444', marginBottom: 2 }}>
                  <span>{subj}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #eee', fontSize: 11, color: '#3b82f6', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>
          🖱️ Click column for full overview
        </div>
      </div>
    );
  }
  return null;
};

export default function CentreLeaderboard({ centreStats = [], selTest, selectedSubject, onCentreClick }) {
  if (!selTest) return <Empty message="Select a test to view rankings" />;
  if (!centreStats.length) return <Empty message={`No test data for ${selTest}`} />;

  // Sort by rank ascending to ensure the highest rank is first (leftmost)
  const isQualSort = selectedSubject === 'Qualification';
  const sortedStats = [...centreStats].sort((a, b) => {
    if (isQualSort) return (b.qualRate || 0) - (a.qualRate || 0);
    return a.rank - b.rank;
  });
  const currentDataKey = isQualSort ? "qualRate" : "avg";
  const currentYLabel = isQualSort ? "Qualification %" : "Average Score";

    const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const data = sortedStats[index];
    
    let isRedFlag = false;
    if (data) {
      if (selectedSubject === 'Total' || !selectedSubject) {
        isRedFlag = data.avg < 100 || (data.qualRate ?? 0) < 80;
      } else if (selectedSubject === 'Qualification') {
        isRedFlag = (data.qualRate ?? 0) < 80;
      } else {
        isRedFlag = data.avg <= 20;
      }
    }
    const centerX = x + width / 2;

    const showInside = height > 70;
    const topY = showInside ? y + 25 : y - 25;
    const textColor = showInside ? "#ffffff" : "#1e293b";
    const subTextColor = showInside ? "#93c5fd" : "#0284c7";

    return (
      <g style={{ pointerEvents: 'none' }}>
        {isRedFlag && (
          <g style={{ pointerEvents: 'none' }}>
            {/* Outermost pulsing ring - delayed */}
            <circle
              cx={centerX}
              cy={topY - 14}
              r={4}
              fill="none"
              stroke="#cc0000"
              strokeWidth={2}
              style={{ animation: 'csrlRingPulse 1.2s ease-out infinite 0.3s', transformOrigin: `${centerX}px ${topY - 14}px` }}
            />
            {/* Middle pulsing ring */}
            <circle
              cx={centerX}
              cy={topY - 14}
              r={4}
              fill="none"
              stroke="#ff0000"
              strokeWidth={2.5}
              style={{ animation: 'csrlRingPulse2 1.2s ease-out infinite' }}
            />
            {/* Inner bold solid dot */}
            <circle
              cx={centerX}
              cy={topY - 14}
              r={6}
              fill="#cc0000"
              stroke="#ffffff"
              strokeWidth={1.5}
              style={{ animation: 'csrlDotBlink 1.2s ease-in-out infinite', filter: 'drop-shadow(0 0 4px #ff0000)' }}
            />
          </g>
        )}
        <text x={centerX} y={topY + (isRedFlag ? 12 : 0)} fill={textColor} textAnchor="middle" fontSize={15} fontWeight={900}>
          {typeof value === 'number' ? Math.round(value) : value}{isQualSort ? '%' : ''}
        </text>

      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 320, marginTop: 0 }}>
      <style>{`
        @keyframes csrlPulse {
          0%   { box-shadow: 0 0 0 0 rgba(220,0,0,1); background: #cc0000; }
          40%  { box-shadow: 0 0 0 10px rgba(220,0,0,0.3); background: #ff0000; }
          80%  { box-shadow: 0 0 0 18px rgba(220,0,0,0); background: #cc0000; }
          100% { box-shadow: 0 0 0 0 rgba(220,0,0,0); background: #cc0000; }
        }
        @keyframes csrlRingPulse {
          0%   { r: 3; stroke-opacity: 1; stroke-width: 3; }
          60%  { r: 14; stroke-opacity: 0.1; stroke-width: 1; }
          100% { r: 16; stroke-opacity: 0; stroke-width: 0.5; }
        }
        @keyframes csrlRingPulse2 {
          0%   { r: 3; stroke-opacity: 0.7; stroke-width: 2; }
          60%  { r: 12; stroke-opacity: 0.05; stroke-width: 1; }
          100% { r: 14; stroke-opacity: 0; stroke-width: 0.5; }
        }
        @keyframes csrlDotBlink {
          0%   { opacity: 1; r: 6; }
          50%  { opacity: 0.75; r: 7; }
          100% { opacity: 1; r: 6; }
        }
      `}</style>
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
            <Label value={currentYLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 16, fontWeight: 'bold', fill: '#64748b' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip selectedSubject={selectedSubject} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar isAnimationActive={false} 
            dataKey={currentDataKey}
            radius={[4, 4, 0, 0]} 
            style={{ cursor: 'pointer' }} 
            fill={isQualSort ? "#8b5cf6" : "#1a4fa0"}
            activeBar={{ fill: isQualSort ? "#a78bfa" : '#2563eb', stroke: isQualSort ? "#c4b5fd" : '#93c5fd', strokeWidth: 2 }}
            onClick={(data) => {
              if (data && data.code && typeof onCentreClick === 'function') {
                onCentreClick(data.code);
              }
            }}
          >
            <LabelList dataKey={currentDataKey} content={renderCustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
