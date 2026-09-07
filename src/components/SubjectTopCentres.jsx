import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

export default function SubjectTopCentres({ data, selectedTestKeys }) {
  const chartData = useMemo(() => {
    if (!data?.profiles) return [];
    
    const keys = selectedTestKeys.length > 1 ? selectedTestKeys : (selectedTestKeys[0] ? [selectedTestKeys[0]] : []);
    let profiles = data.profiles;
    if (keys.length > 0) {
      profiles = profiles.filter(p => keys.some(k => p.ROLL_KEY?.includes(k) || p.TEST_KEY === k));
    }
    
    const centreMap = {};
    profiles.forEach(p => {
      const centre = p.centerCode || p.center || 'Unknown';
      if (!centreMap[centre]) {
         centreMap[centre] = { count: 0, PHY: 0, CHE: 0, MATH: 0 };
      }
      centreMap[centre].count++;
      
      const raw = p.rawScores || {};
      const rKeys = Object.keys(raw);
      
      const getScore = (sub) => {
         let k = null;
         for (const key of keys) {
            k = rKeys.find(rk => rk === `${key}_${sub}` || rk === `${key}_${sub.toUpperCase()}` || rk === `${key}_${sub.toLowerCase()}`);
            if (k) break;
         }
         if (!k) k = rKeys.find(rk => rk === sub || rk.toLowerCase().endsWith('_' + sub.toLowerCase()));
         if (k && !isNaN(Number(raw[k]))) {
             let val = Number(raw[k]);
             return val > 0 ? val : 0;
         }
         return 0;
      };
      
      centreMap[centre].PHY += getScore('Physics');
      centreMap[centre].CHE += getScore('Chemistry');
      centreMap[centre].MATH += Math.max(getScore('Math'), getScore('Mathematics'));
    });
    
    const centres = Object.keys(centreMap).map(c => {
       const cnt = centreMap[c].count || 1;
       return {
         code: c,
         PHY: centreMap[c].PHY / cnt,
         CHE: centreMap[c].CHE / cnt,
         MATH: centreMap[c].MATH / cnt
       };
    });
    
    const topPhy = [...centres].sort((a,b) => b.PHY - a.PHY).slice(0, 3);
    const topChe = [...centres].sort((a,b) => b.CHE - a.CHE).slice(0, 3);
    const topMath = [...centres].sort((a,b) => b.MATH - a.MATH).slice(0, 3);
    
    return [
      {
        subject: 'PHY',
        top1Code: topPhy[0]?.code || '', top1Val: Math.round(topPhy[0]?.PHY || 0),
        top2Code: topPhy[1]?.code || '', top2Val: Math.round(topPhy[1]?.PHY || 0),
        top3Code: topPhy[2]?.code || '', top3Val: Math.round(topPhy[2]?.PHY || 0),
      },
      {
        subject: 'CHEM',
        top1Code: topChe[0]?.code || '', top1Val: Math.round(topChe[0]?.CHE || 0),
        top2Code: topChe[1]?.code || '', top2Val: Math.round(topChe[1]?.CHE || 0),
        top3Code: topChe[2]?.code || '', top3Val: Math.round(topChe[2]?.CHE || 0),
      },
      {
        subject: 'MATH',
        top1Code: topMath[0]?.code || '', top1Val: Math.round(topMath[0]?.MATH || 0),
        top2Code: topMath[1]?.code || '', top2Val: Math.round(topMath[1]?.MATH || 0),
        top3Code: topMath[2]?.code || '', top3Val: Math.round(topMath[2]?.MATH || 0),
      }
    ];
  }, [data, selectedTestKeys]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, marginTop: 0, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: '-0.3px', borderBottom: '2px solid #2563eb20', paddingBottom: 4, marginBottom: 12 }}>
        <Activity size={16} aria-hidden="true" />
        Subject Top 3
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 5, left: -20, bottom: 0 }} barGap={2} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={25} />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 11 }} />
            <Bar dataKey="top1Val" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Rank 1">
              <LabelList dataKey="top1Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top1Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar dataKey="top2Val" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Rank 2">
              <LabelList dataKey="top2Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top2Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
            <Bar dataKey="top3Val" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Rank 3">
              <LabelList dataKey="top3Code" position="top" fill="#475569" fontSize={8} fontWeight={700} formatter={(v) => v || ''} />
              <LabelList dataKey="top3Val" position="insideTop" fill="#fff" fontSize={7} fontWeight={800} formatter={(v) => v > 0 ? v : ''} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
