import { useMemo, useState } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

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

function RankRow({ rank, name, center, score, idx, roll, rawScores, selectedTest, onClick }) {
  const [fg, bg] = AVATAR_COLORS[0];
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  
  const subjects = ['Physics', 'Chemistry', 'Math', 'Mathematics', 'Biology', 'Botany', 'Zoology'];
  
  const subColors = {
    'Physics': '#3b82f6',     // blue
    'Chemistry': '#8b5cf6',   // purple
    'Math': '#10b981',        // emerald
    'Mathematics': '#10b981', // emerald
    'Biology': '#ec4899',     // pink
    'Botany': '#14b8a6',      // teal
    'Zoology': '#f59e0b'      // amber
  };

  const parsedScores = [];
  let maxPossibleTotal = 0; // typically 300 for JEE, 720 for NEET

  if (rawScores) {
    subjects.forEach(sub => {
      const keys = Object.keys(rawScores);
      let matchedKey = null;
      if (selectedTest && selectedTest !== 'Multiple Tests') {
         matchedKey = keys.find(k => k === `${selectedTest}_${sub}` || k === `${selectedTest}_${sub.toUpperCase()}` || k === `${selectedTest}_${sub.toLowerCase()}`);
      }
      if (!matchedKey) {
         matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
      }
      
      if (matchedKey && rawScores[matchedKey] !== undefined && rawScores[matchedKey] !== null && rawScores[matchedKey] !== '') {
        const val = Number(rawScores[matchedKey]);
        if (!isNaN(val)) {
          let abbr = sub.substring(0, 3);
          if (sub === 'Mathematics') abbr = 'Mat';
          parsedScores.push({ abbr, val, color: subColors[sub] || '#94a3b8' });
          maxPossibleTotal += 100; // assuming each subject is out of 100 roughly
        }
      }
    });
  }
  
  // fallback max if no subjects parsed
  if (maxPossibleTotal === 0) maxPossibleTotal = 300;
  
  // if total parsed subjects > 3 (like NEET), it might be 720. Let's just use sum of subjects max.
  // Actually, standard is: total max = Math.max(300, maxPossibleTotal)
  const maxBarVal = Math.max(score || 0, maxPossibleTotal);

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
      <div style={{ flex:1, minWidth:0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#1e293b', whiteSpace:'nowrap', flexShrink:0 }}>{name}</div>
        <div style={{ fontSize:8, color:'#64748b', fontWeight:600, flexShrink:0 }}>{center}</div>
        
        {parsedScores.length > 0 && (
          <div style={{ 
            flex: 1, 

            height: '14px', 
            background: '#f1f5f9', 
            borderRadius: '4px', 
            display: 'flex', 
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            marginLeft: '8px'
          }}>
            {parsedScores.map((sc, i) => {
              const widthPct = Math.max(0, Math.min(100, (sc.val / maxBarVal) * 100));
              return (
                <div 
                  key={i} 
                  title={`${sc.abbr}: ${sc.val}`}
                  style={{ 
                    height: '100%', 
                    width: `${widthPct}%`, 
                    background: sc.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: i < parsedScores.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                  }}
                >
                  {widthPct > 15 && <span style={{fontSize: 7, color: '#fff', fontWeight: 800, letterSpacing: '-0.2px'}}>{sc.val}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ background:fg+'20', color:fg, fontWeight:800,
        fontSize:10, padding:'2px 6px', borderRadius:20, flexShrink:0, minWidth: 32, textAlign: 'center' }}>{score}</div>
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
           bg="#f0f5ff" color="#1a4fa0"/>
        <KpiCard icon={BarChart3} value={centreBoard.length} label="Active Centres"
          sub={`${redFlagCentres.length} need attention`} bg="#fff7ed" color="#b45309"/>
        <KpiCard 
          icon={(qualRate !== null && qualRate < 80) ? Flag : Award}    
          value={qualRate !== null ? `${qualRate}%` : '—'} 
          label="Overall Qual. Rate"
          sub={`${totalQualified} / ${totalAppeared} qualified`} 
          bg={(qualRate !== null && qualRate < 80) ? "#fef2f2" : "#f0fdf4"} 
          color={(qualRate !== null && qualRate < 80) ? "#f97316" : "#16a34a"}
        />
        <KpiCard icon={Target}   value={avgScore !== null ? avgScore : '—'}
          label={`Avg Score (${selectedTestKey||'Latest'})`}
          sub={topCentre ? `Best: ${topCentre.code} (${Math.round(topCentre.avg)})` : ''} bg="#faf5ff" color="#7c3aed"/>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 20 }}>
        {/* Left Column: Stacked Students & Centres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
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
                  
                  // Gauge chart calculations
                  const score = Math.round(c.avg);
                  const maxScore = 300; // standard JEE max, adjust if needed
                  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
                  const strokeWidth = 10;
                  const radius = 40;
                  const circumference = Math.PI * radius;
                  const dashoffset = circumference - (percentage / 100) * circumference;
                  
                  // Vibrant colors
                  const color = isAlert ? '#f97316' : '#2563eb'; // Orange if alert, Blue otherwise
                  const bg = '#e2e8f080';

                  return (
                    <div key={c.code} style={{ padding:'6px 2px 4px 2px', borderRadius:10, textAlign:'center',
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      cursor: onViewCentre ? 'pointer' : 'default',
                      display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      onClick={() => onViewCentre && onViewCentre(c.code)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
                    >
                      <div style={{ position: 'relative', width: '100%', maxWidth: '60px', aspectRatio: '2/1', marginBottom: '4px' }}>
                        <svg viewBox="0 0 100 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          {/* Background Arc */}
                          <path
                            d={`M 10 45 A ${radius} ${radius} 0 0 1 90 45`}
                            fill="none"
                            stroke={bg}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                          />
                          {/* Value Arc (with glow filter) */}
                          <defs>
                            <filter id={`glow-${c.code}`} x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>
                          <path
                            d={`M 10 45 A ${radius} ${radius} 0 0 1 90 45`}
                            fill="none"
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashoffset}
                            filter={`url(#glow-${c.code})`}
                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: color, letterSpacing: '-0.5px' }}>
                          {score}
                        </div>
                      </div>
                      

                      <div style={{ fontSize:8, fontWeight:600, color: '#64748b', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {medals[c.rank] && <span style={{fontSize:9}}>{medals[c.rank]}</span>} {c.code}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    <SectionTitle Icon={Star} color="#2563eb">Top 5 Centres by Average Score</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom: bottomCentres.length > 0 ? 6 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <>
                        <SectionTitle Icon={Star} color="#2563eb">Bottom 5 Centres</SectionTitle>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2 }}>
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

        {/* Left Column: Top 5 Students */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#2563eb">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : (() => {
                const chartData = top5.map(s => {
                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   
                   let d = { name: shortName, total: s.marks ?? s.score };
                   if (s.rawScores) {
                      ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                          const keys = Object.keys(s.rawScores);
                          let matchedKey = null;
                          if (selectedTestKey && selectedTestKey !== 'Multiple Tests') {
                             matchedKey = keys.find(k => k === `${selectedTestKey}_${sub}` || k === `${selectedTestKey}_${sub.toUpperCase()}` || k === `${selectedTestKey}_${sub.toLowerCase()}`);
                          }
                          if (!matchedKey) {
                             matchedKey = keys.find(k => k === sub || k.toLowerCase().endsWith('_' + sub.toLowerCase()));
                          }
                          if (matchedKey && !isNaN(Number(s.rawScores[matchedKey]))) {
                             d[sub] = Number(s.rawScores[matchedKey]);
                          }
                      });
                   }
                   return d;
                });
                return (
                  <div style={{ height: 115, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 35, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis yAxisId="left" type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} interval={0} width={50} />
                        <YAxis yAxisId="right" orientation="right" type="category" dataKey="total" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#1e293b', fontWeight: 800}} interval={0} width={25} />
                        <Tooltip 
                           contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 600 }}
                           cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar yAxisId="left" dataKey="Physics" stackId="a" fill="#3b82f6" barSize={18}>
                          <LabelList dataKey="Physics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Phy ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Chemistry" stackId="a" fill="#8b5cf6">
                          <LabelList dataKey="Chemistry" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Che ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Math" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Math" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Mat ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Mathematics" stackId="a" fill="#0ea5e9">
                          <LabelList dataKey="Mathematics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Mat ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Biology" stackId="a" fill="#ec4899">
                          <LabelList dataKey="Biology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bio ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Botany" stackId="a" fill="#14b8a6">
                          <LabelList dataKey="Botany" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bot ${v}` : ''} />
                        </Bar>
                        <Bar yAxisId="left" dataKey="Zoology" stackId="a" fill="#f59e0b">
                          <LabelList dataKey="Zoology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Zoo ${v}` : ''} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()
          }
        </div>
        </div> {/* Close Stacked Left Column */}
            
        {/* Middle Column: Radial Progress Chart */}
        <div style={{ background:'#fff', borderRadius:14, padding:'6px 8px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle Icon={PieChartIcon} color="#2563eb">
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
              const radialData = top5Qual.map((c, i) => {
                const rank = sortedByQual.findIndex(x => x.code === c.code) + 1;
                return {
                  name: c.code,
                  value: Math.round(c.qualRate || 0),
                  fill: colors[i % colors.length],
                  rank
                };
              }).reverse();
              
              const legendPayload = top5Qual.map((c, i) => {
                const rank = sortedByQual.findIndex(x => x.code === c.code) + 1;
                return {
                  value: `${rank}. ${c.code}`,
                  type: 'square',
                  color: colors[i % colors.length]
                };
              });
              
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
                      labelFormatter={(label, payload) => `Rank ${payload?.[0]?.payload?.rank || (5 - Number(label))}`}
                      formatter={(val, name, props) => [`${val}%`, props?.payload?.name || 'Qual Rate']}
                    />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      wrapperStyle={{ right: 0 }} 
                      content={(props) => (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {legendPayload.map((entry, index) => (
                            <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 10, color: entry.color, fontWeight: 700 }}>
                              <span style={{ width: 8, height: 8, backgroundColor: entry.color, marginRight: 6, display: 'inline-block' }}></span>
                              {entry.value}
                            </li>
                          ))}
                        </ul>
                      )}
                    />
                    
                    
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
              <SectionTitle Icon={PieChartIcon} color="#2563eb">Centre Distribution</SectionTitle>
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
                          <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={600}>
                            {name}
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {sorted.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={(entry.avg||0) >= overallAvg ? '#3b82f6' : '#f97316'} 
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
                              <span style={{ color: isAbove ? '#3b82f6' : '#f97316', fontWeight: 600, fontSize: 13 }}>
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
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
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
