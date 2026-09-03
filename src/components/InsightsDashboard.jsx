import { useMemo, useState } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

function pct(n, d) { return !d ? 0 : Math.round((n / d) * 100); }

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

const AVATAR_COLORS = [
  ['#1a4fa0', '#e8f0fc'], ['#1a6e3b', '#e6f5ed'], ['#b45309', '#fff3e0'],
  ['#7c3aed', '#f3f0ff'], ['#0891b2', '#e0f7fa'],
];

function SectionTitle({ Icon, children, color = '#1a4fa0' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6,
      fontSize:14, fontWeight:800, color, letterSpacing:0.2 }}>
      <Icon size={15} />{children}
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, sub, bg, color }) {
  return (
    <div style={{ background:bg, borderRadius:10, padding:'6px 12px', display:'flex',
      alignItems:'center', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', flex:1, minWidth:0 }}>
      <div style={{ width:34, height:34, borderRadius:8, background:color+'22',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontSize:18, fontWeight:900, color, lineHeight:1.1 }}>{value}</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#475569', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
        </div>
        {sub && <div style={{ fontSize:10, color:'#94a3b8', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{sub}</div>}
      </div>
    </div>
  );
}

function RankRow({ rank, name, center, score, idx, roll, rawScores, onClick }) {
  const [fg, bg] = AVATAR_COLORS[0];
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  
  const subjects = ['Physics', 'Chemistry', 'Math', 'Mathematics', 'Biology', 'Botany', 'Zoology'];
  const subjectScores = [];
  if (rawScores) {
    subjects.forEach(sub => {
      // Find a key in rawScores that matches the subject (e.g. exactly 'Physics' or ends with '_Physics')
      const matchedKey = Object.keys(rawScores).find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {
        let abbr = sub.substring(0, 3);
        if (sub === 'Mathematics') abbr = 'Mat';
        subjectScores.push(`${abbr}: ${rawScores[matchedKey]}`);
      }
    });
  }

  return (
    <div 
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:10, padding:'2px 4px',
      borderRadius:8, background: rank % 2 === 0 ? '#f8fafc' : '#fff',
      marginBottom:2, border:'none', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; } }}
      onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ width:16, textAlign:'center', fontSize:10, fontWeight:800, flexShrink:0,
        color: rank <= 3 ? '#f59e0b' : '#94a3b8' }}>{medals[rank] || `${rank}`}</div>
      <div style={{ flex:1, minWidth:0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#1e293b', whiteSpace:'nowrap' }}>{name}</div>
        <div style={{ fontSize:8, color:'#64748b', fontWeight:600 }}>{center}</div>
        {subjectScores.length > 0 && (
          <div style={{ fontSize: 8, color: '#64748b', display: 'flex', gap: 4, alignItems: 'center' }}>
            {subjectScores.map((sc, i) => (
              <span key={i} style={{ background: '#f1f5f9', padding: '1px 3px', borderRadius: 2, fontWeight: 600, border: '1px solid #e2e8f0' }}>{sc}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ background:fg+'20', color:fg, fontWeight:800,
        fontSize:10, padding:'2px 6px', borderRadius:20, flexShrink:0 }}>{score}</div>
    </div>
  );
}

function ProgressBar({ value, max, color, bg, label, count }) {
  const p = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12,
        fontWeight:600, color:'#475569', marginBottom:4 }}>
        <span>{label}</span>
        <span style={{ color }}>{count} <span style={{ color:'#94a3b8', fontWeight:400 }}>({Math.round(p)}%)</span></span>
      </div>
      <div style={{ height:7, borderRadius:10, background:bg, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${p}%`, borderRadius:10, background:color, transition:'width 0.8s ease' }}/>
      </div>
    </div>
  );
}

export default function InsightsDashboard({ data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre }) {
  const [showBottom5Qual, setShowBottom5Qual] = useState(false);
  const profiles = data?.profiles || [];
  const tests    = data?.tests    || [];

  const totalStudents = profiles.length;
  const jeeCount      = profiles.filter(p => (p.stream||'JEE') === 'JEE').length;
  const neetCount     = profiles.filter(p => p.stream === 'NEET').length;
  const totalCentres  = new Set(profiles.map(p => p.centerCode).filter(Boolean)).size;

  const maleCount   = profiles.filter(p => ['M','Male','MALE'].includes((p.GENDER||'').trim())).length;
  const femaleCount = profiles.filter(p => ['F','Female','FEMALE'].includes((p.GENDER||'').trim())).length;

  const catMap = {};
  profiles.forEach(p => { const c=(p.CATEGORY||'Unknown').trim().toUpperCase(); catMap[c]=(catMap[c]||0)+1; });
  const catEntries = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0,6);

  const stateMap = {};
  profiles.forEach(p => { const s=(p.STATE||'').trim(); if(s) stateMap[s]=(stateMap[s]||0)+1; });
  const topStates = Object.entries(stateMap).sort((a,b) => b[1]-a[1]).slice(0,5);

  const redFlagCentres = centreBoard.filter(c => c.avg < 100 || (c.qualRate??0) < 80);
  const healthyCentres = centreBoard.filter(c => c.avg >= 100 && (c.qualRate??0) >= 80);

  const top5    = (topRanked    || []).slice(0,5);
  const bottom5 = (bottomRanked || []).slice(0,5);

  const totalAppeared  = centreBoard.reduce((s,c) => s+(c.tested||0), 0);
  const totalQualified = centreBoard.reduce((s,c) => s+(c.qualifiedCount||0), 0);
  const qualRate       = totalAppeared ? pct(totalQualified,totalAppeared) : null;
  const avgScore       = centreBoard.length ? Math.round(centreBoard.reduce((s,c) => s+(c.avg||0),0)/centreBoard.length) : null;
  const topCentre      = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0))[0];

  if (!data || totalStudents === 0) return (
    <div style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:14 }}>Loading insights…</div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── KPI Cards ── */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        <KpiCard icon={Users}    value={totalStudents} label="Total Students"
          sub={`JEE: ${jeeCount}  ·  NEET: ${neetCount}`} bg="#f0f5ff" color="#1a4fa0"/>
        <KpiCard icon={BarChart3} value={centreBoard.length} label="Active Centres"
          sub={`${redFlagCentres.length} need attention`} bg="#fff7ed" color="#b45309"/>
        <KpiCard 
          icon={(qualRate !== null && qualRate < 80) ? Flag : Award}    
          value={qualRate !== null ? `${qualRate}%` : '—'} 
          label="Overall Qual. Rate"
          sub={`${totalQualified} / ${totalAppeared} qualified`} 
          bg={(qualRate !== null && qualRate < 80) ? "#fef2f2" : "#f0fdf4"} 
          color={(qualRate !== null && qualRate < 80) ? "#ef4444" : "#16a34a"}
        />
        <KpiCard icon={Target}   value={avgScore !== null ? avgScore : '—'}
          label={`Avg Score (${selectedTestKey||'Latest'})`}
          sub={topCentre ? `Best: ${topCentre.code} (${Math.round(topCentre.avg)})` : ''} bg="#faf5ff" color="#7c3aed"/>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 20 }}>
        {/* Left Column: Stacked Students & Centres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
        {/* Left Column: Top 5 Students */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#f59e0b">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : top5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} onClick={() => onViewStudent && onViewStudent(s.roll)} />)
          }
        </div>

      {/* Stacked Top 10 Centres ── */}
      {centreBoard.length > 0 && (() => {
        const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0));
        return (
            <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
              
              {(() => {
                const topCentres = sorted.slice(0,5).map((c,i) => ({...c, rank: i+1}));
                const bottomCentres = sorted.length > 5 ? sorted.slice(-5).map((c,i) => ({...c, rank: sorted.length - 5 + i + 1})) : [];
                
                const renderCard = (c) => {
                  const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                  const medals = {1:'🥇',2:'🥈',3:'🥉'};
                  const rankDisplay = medals[c.rank] || `${c.rank}`;
                  return (
                    <div key={c.code} style={{ padding:'1px 1px', borderRadius:8, textAlign:'center',
                      background: isAlert ? '#fef2f2' : '#f8fafc',
                      border: isAlert ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      cursor: onViewCentre ? 'pointer' : 'default' }}
                      onClick={() => onViewCentre && onViewCentre(c.code)}>
                      <div style={{ fontSize:8, display:'flex', justifyContent:'center', alignItems:'center', gap: 4 }}>
                        {rankDisplay} <span style={{ fontWeight:800, color:'#1e293b' }}>{c.code}</span>
                      </div>
                      <div style={{ fontSize:10, fontWeight:900, color: isAlert?'#dc2626':'#1a4fa0', marginTop:0 }}>
                        {Math.round(c.avg)}
                      </div>
                      {c.qualRate !== undefined && (
                        <div style={{ marginTop:0, fontSize:7, fontWeight:700,
                          color: isAlert ? '#dc2626' : '#1a4fa0' }}>
                          {Math.round(c.qualRate)}% Qual.
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <>
                    <SectionTitle Icon={Star} color="#f59e0b">Top 5 Centres by Average Score</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3, marginBottom: bottomCentres.length > 0 ? 6 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <>
                        <SectionTitle Icon={TrendingDown} color="#dc2626">Bottom 5 Centres</SectionTitle>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:3 }}>
                          {bottomCentres.map(renderCard)}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          );
        })()}
        </div> {/* Close Stacked Left Column */}
            
        {/* Middle Column: Radial Progress Chart */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle Icon={PieChartIcon} color={showBottom5Qual ? "#dc2626" : "#f59e0b"}>
              {showBottom5Qual ? 'Bottom 5 Centres Qual %' : 'Top 5 Centres Qual %'}
            </SectionTitle>
            <span 
              onClick={() => setShowBottom5Qual(!showBottom5Qual)}
              style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', cursor: 'pointer', userSelect: 'none', padding: '2px 6px', background: '#eff6ff', borderRadius: 4, marginBottom: 6 }}
            >
              Show {showBottom5Qual ? 'Top 5' : 'Bottom 5'}
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {(() => {
              if (!centreBoard || centreBoard.length === 0) return <div>No Data</div>;
              const sortedByQual = [...centreBoard].sort((a,b) => (b.qualRate||0) - (a.qualRate||0));
              const top5Qual = showBottom5Qual ? sortedByQual.slice(-5) : sortedByQual.slice(0, 5);
              
              const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
              // Reverse so the #1 rank is on the outermost ring
              const radialData = top5Qual.map((c, i) => ({
                name: c.code,
                value: Math.round(c.qualRate || 0),
                fill: colors[i % colors.length]
              })).reverse();
              
              const avgQual = Math.round(top5Qual.reduce((s, c) => s + (c.qualRate||0), 0) / (top5Qual.length||1));

              return (
                <ResponsiveContainer width="100%" height={180}>
                  <RadialBarChart 
                    cx="50%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar 
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      cornerRadius={10}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%` }}
                      onClick={(data, index) => { if (onViewCentre && data && data.name) { onViewCentre(data.name); } else if (onViewCentre && data && data.payload && data.payload.name) { onViewCentre(data.payload.name); } }}
                      style={{ cursor: 'pointer' }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }} 
                      labelFormatter={(label) => `Rank ${Number(label) + 1}`}
                      formatter={(val, name, props) => [`${val}%`, props?.payload?.name || 'Qual Rate']}
                    />
                    <Legend iconSize={8} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: 10 }} />
                    
                    
                  </RadialBarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>

        {/* Right Column: Pie Chart */}
        {centreBoard.length > 0 && (() => {
            const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0));
            const overallAvg = sorted.reduce((sum, c) => sum + (c.avg||0), 0) / (sorted.length || 1);
            return (
            <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <SectionTitle Icon={PieChartIcon} color="#f59e0b">Centre Distribution</SectionTitle>
              <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie 
                      data={sorted.map(c => ({...c, equalValue: 1}))} 
                      dataKey="equalValue" 
                      nameKey="code" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={35} 
                      outerRadius={55} 
                      paddingAngle={1}
                      label={({ cx, cy, midAngle, outerRadius, name, index }) => {
                        const RADIAN = Math.PI / 180;
                        // Alternate radius to prevent overlapping
                        const radius = outerRadius + 10 + (index % 2 === 0 ? 0 : 12);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const isAbove = (sorted[index]?.avg || 0) >= overallAvg;
                        return (
                          <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#ef4444'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={600}>
                            {name}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {sorted.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={(entry.avg||0) >= overallAvg ? '#3b82f6' : '#ef4444'} 
                          style={{ cursor: onViewCentre ? 'pointer' : 'default', outline: 'none' }}
                          onClick={() => onViewCentre && onViewCentre(entry.code)}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isAbove = (data.avg || 0) >= overallAvg;
                          return (
                            <div style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                              <span style={{ color: isAbove ? '#3b82f6' : '#ef4444', fontWeight: 600, fontSize: 13 }}>
                                Centre {payload[0].name}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Above Average</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Below Average</span>
                  </div>
                </div>
              </div>
            </div>
          );
      })()}
      
      </div> {/* End Main Dashboard Layout */}

    </div>
  );
}
