import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

const renderBarShape = (props, dataKey, activeItem) => {
  const { fill, x, y, width, height, index, payload } = props;
  const isActive = activeItem && activeItem.index === index && activeItem.dataKey === dataKey;
  
  let barFill = fill;
  if (payload && payload.subject) {
    if (payload.subject === 'PHY') barFill = '#3b82f6';
    else if (payload.subject === 'CHEM') barFill = '#8b5cf6';
    else if (payload.subject === 'MATH') barFill = '#0ea5e9';
  }
  
  const adjustedX = isActive ? x - 2 : x;
  const adjustedY = isActive ? y - 2 : y;
  const adjustedWidth = isActive ? width + 4 : width;
  const adjustedHeight = isActive ? height + 2 : height;
  
  return (
    <g>
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={barFill} rx={6} ry={6} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <rect x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3DVertical)" rx={6} ry={6} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};

const renderNameLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill="#334155" 
      fontSize={8.5} 
      fontWeight={900} 
      textAnchor="start" 
      letterSpacing="0.5px"
      transform={`rotate(-45 ${x + width / 2} ${y - 2})`}
      style={{ filter: 'drop-shadow(1px 1px 0px rgba(37,99,235,0.25))' }}
    >
      {value}
    </text>
  );
};

const renderCentreLabel = (props) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <g>
      {/* Sharp outline stroke first (rendered behind) */}
      <text
        x={x + width / 2}
        y={y + 17}
        fill="rgba(0,0,0,0.35)"
        fontSize={6}
        fontWeight={900}
        textAnchor="middle"
        dominantBaseline="auto"
        letterSpacing={0.8}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      >
        {value}
      </text>
      {/* Crisp white text on top */}
      <text
        x={x + width / 2}
        y={y + 17}
        fill="#ffffff"
        fontSize={6}
        fontWeight={900}
        textAnchor="middle"
        dominantBaseline="auto"
        letterSpacing={0.8}
        style={{ filter: 'drop-shadow(0px 0px 1px rgba(255,255,255,0.9))' }}
      >
        {value}
      </text>
    </g>
  );
};

export default function SubjectTopStudents({ subjectTopStudents, onViewStudent }) {
  const [activeItem, setActiveItem] = useState(null);
  const chartData = subjectTopStudents || [];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 0, height: '100%' }}>
      <div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <Activity size={18} color="#3b82f6" aria-hidden="true" />
          <span style={{ fontSize:15, fontWeight:800, letterSpacing:0.2, color: 'rgba(37, 99, 235, 0.95)', textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>Subject Top 3 Stud</span>
        </div>
        <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:2, background:'linear-gradient(90deg,rgba(59,130,246,0.5),transparent)', boxShadow:'0 1px 3px rgba(59,130,246,0.3)' }} />
      </div>
      <div style={{ flex: 1, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 120, right: 5, left: 5, bottom: 0 }} barGap={0} barSize={26} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 120]} ticks={[0, 30, 60, 90, 120]} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={32} />
            <Bar barSize={18} isAnimationActive={false} shape={(props) => renderBarShape(props, "top1Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top1Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1" onClick={(data) => onViewStudent && data.top1Roll && onViewStudent(data.top1Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top1Code" content={renderNameLabel} />
              <LabelList dataKey="top1Centre" content={renderCentreLabel} />
              <LabelList dataKey="top1Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar barSize={18} isAnimationActive={false} shape={(props) => renderBarShape(props, "top2Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top2Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2" onClick={(data) => onViewStudent && data.top2Roll && onViewStudent(data.top2Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top2Code" content={renderNameLabel} />
              <LabelList dataKey="top2Centre" content={renderCentreLabel} />
              <LabelList dataKey="top2Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar barSize={18} isAnimationActive={false} shape={(props) => renderBarShape(props, "top3Val", activeItem)} onMouseEnter={(_, index) => setActiveItem({index, dataKey: "top3Val"})} onMouseLeave={() => setActiveItem(null)} dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3" onClick={(data) => onViewStudent && data.top3Roll && onViewStudent(data.top3Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top3Code" content={renderNameLabel} />
              <LabelList dataKey="top3Centre" content={renderCentreLabel} />
              <LabelList dataKey="top3Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
