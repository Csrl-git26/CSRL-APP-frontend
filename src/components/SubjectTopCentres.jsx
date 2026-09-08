import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function SubjectTopCentres({ centreBoard, onViewCentre }) {
  const chartData = useMemo(() => {
    if (!centreBoard || centreBoard.length === 0) return [];
    
    // Sort by Physics
    const topPhy = [...centreBoard].sort((a,b) => (b.Physics || 0) - (a.Physics || 0)).slice(0, 3);
    // Sort by Chemistry
    const topChe = [...centreBoard].sort((a,b) => (b.Chemistry || 0) - (a.Chemistry || 0)).slice(0, 3);
    // Sort by Math
    const topMath = [...centreBoard].sort((a,b) => (b.Math || 0) - (a.Math || 0)).slice(0, 3);
    
    return [
      {
        subject: 'PHY',
        top1Code: topPhy[0]?.code || '', top1Val: Math.round(topPhy[0]?.Physics || 0),
        top2Code: topPhy[1]?.code || '', top2Val: Math.round(topPhy[1]?.Physics || 0),
        top3Code: topPhy[2]?.code || '', top3Val: Math.round(topPhy[2]?.Physics || 0),
      },
      {
        subject: 'CHEM',
        top1Code: topChe[0]?.code || '', top1Val: Math.round(topChe[0]?.Chemistry || 0),
        top2Code: topChe[1]?.code || '', top2Val: Math.round(topChe[1]?.Chemistry || 0),
        top3Code: topChe[2]?.code || '', top3Val: Math.round(topChe[2]?.Chemistry || 0),
      },
      {
        subject: 'MATH',
        top1Code: topMath[0]?.code || '', top1Val: Math.round(topMath[0]?.Math || 0),
        top2Code: topMath[1]?.code || '', top2Val: Math.round(topMath[1]?.Math || 0),
        top3Code: topMath[2]?.code || '', top3Val: Math.round(topMath[2]?.Math || 0),
      }
    ];
  }, [centreBoard]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', borderBottom: '1px solid #f1f5f9', paddingBottom: 6, marginBottom: 14 }}>
        <Activity size={18} color="#3b82f6" aria-hidden="true" />
        Subject Top 3
      </div>
      <div style={{ flex: 1, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 15, right: 5, left: -20, bottom: 0 }} barGap={2} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
            <Bar dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1" onClick={(data) => onViewCentre && data.top1Code && onViewCentre(data.top1Code)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top1Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top1Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2" onClick={(data) => onViewCentre && data.top2Code && onViewCentre(data.top2Code)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top2Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top2Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3" onClick={(data) => onViewCentre && data.top3Code && onViewCentre(data.top3Code)} style={{ cursor: 'pointer' }}>
              <LabelList dataKey="top3Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top3Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
