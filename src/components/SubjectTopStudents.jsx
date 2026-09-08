import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

const CustomActiveBar = (props) => {
  const { fill, x, y, width, height } = props;
  return (
    <rect 
      x={x - 3} 
      y={y - 3} 
      width={width + 6} 
      height={height + 3} 
      fill={fill} 
      rx={4} 
      ry={4} 
      style={{ filter: 'brightness(1.1)' }}
    />
  );
};

const renderCustomLabel = (props) => {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text 
      x={x + width / 2} 
      y={y - 2} 
      fill="#475569" 
      fontSize={7.5} 
      fontWeight={800} 
      textAnchor="start" 
      transform={`rotate(-45 ${x + width / 2} ${y - 2})`}
    >
      {value}
    </text>
  );
};

export default function SubjectTopStudents({ subjectTopStudents, onViewStudent }) {
  const chartData = subjectTopStudents || [];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 14 }}>
        <Activity size={18} color="#3b82f6" aria-hidden="true" />
        Subject Top 3 Students
      </div>
      <div style={{ flex: 1, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 30, right: 10, left: -20, bottom: 0 }} barGap={2} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
            <Bar activeBar={<CustomActiveBar />} dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1" onClick={(data) => onViewStudent && data.top1Roll && onViewStudent(data.top1Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top1Code" content={renderCustomLabel} />
              <LabelList dataKey="top1Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar activeBar={<CustomActiveBar />} dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2" onClick={(data) => onViewStudent && data.top2Roll && onViewStudent(data.top2Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top2Code" content={renderCustomLabel} />
              <LabelList dataKey="top2Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar activeBar={<CustomActiveBar />} dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3" onClick={(data) => onViewStudent && data.top3Roll && onViewStudent(data.top3Roll)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top3Code" content={renderCustomLabel} />
              <LabelList dataKey="top3Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
