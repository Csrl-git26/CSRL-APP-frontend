import { useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14,
      fontSize:14, fontWeight:800, color, letterSpacing:0.2 }}>
      <Icon size={15} />{children}
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, sub, bg, color }) {
  return (
    <div style={{ background:bg, borderRadius:12, padding:'16px 18px', display:'flex',
      alignItems:'flex-start', gap:14, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', flex:1, minWidth:0 }}>
      <div style={{ width:44, height:44, borderRadius:10, background:color+'22',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={20} color={color}/>
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:26, fontWeight:900, color, lineHeight:1.1 }}>{value}</div>
        <div style={{ fontSize:12, color:'#475569', fontWeight:600, marginTop:2 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function RankRow({ rank, name, center, score, idx, roll, rawScores, onClick }) {
  const [fg, bg] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
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
      style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
      borderRadius:8, background: rank % 2 === 0 ? '#f8fafc' : '#fff',
      marginBottom:4, border:'1px solid #f1f5f9', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
      onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; } }}
      onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
    >
      <div style={{ width:24, textAlign:'center', fontSize:14, fontWeight:800, flexShrink:0,
        color: rank <= 3 ? '#f59e0b' : '#94a3b8' }}>{medals[rank] || `#${rank}`}</div>
      <div style={{ width:36, height:36, borderRadius:'50%', background:bg,
        color:fg, fontWeight:800, fontSize:13, display:'flex', alignItems:'center',
        justifyContent:'center', flexShrink:0, border:'2px solid rgba(0,0,0,0.07)' }}>
        {rank === 1 ? '🌟' : getInitials(name)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1e293b',
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
          <div style={{ fontSize:11, color:'#64748b' }}>{center}</div>
        </div>
      </div>
      {subjectScores.length > 0 && (
        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', gap: 6, alignItems: 'center', marginRight: 4 }}>
          {subjectScores.map((sc, i) => (
            <span key={i} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{sc}</span>
          ))}
        </div>
      )}
      <div style={{ background:fg+'20', color:fg, fontWeight:800,
        fontSize:13, padding:'3px 10px', borderRadius:20, flexShrink:0 }}>{score}</div>
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
        <KpiCard icon={BarChart3} value={totalCentres} label="Active Centres"
          sub={`${redFlagCentres.length} need attention`} bg="#fff7ed" color="#b45309"/>
        <KpiCard icon={Award}    value={qualRate !== null ? `${qualRate}%` : '—'} label="Overall Qual. Rate"
          sub={`${totalQualified} / ${totalAppeared} qualified`} bg="#f0fdf4" color="#16a34a"/>
        <KpiCard icon={Target}   value={avgScore !== null ? avgScore : '—'}
          label={`Avg Score (${selectedTestKey||'Latest'})`}
          sub={topCentre ? `Best: ${topCentre.code} (${Math.round(topCentre.avg)})` : ''} bg="#faf5ff" color="#7c3aed"/>
      </div>

      {/* ── Top 5 + Bottom 5 ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#f59e0b">Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : top5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i} roll={s.roll} rawScores={s.rawScores} onClick={() => onViewStudent && onViewStudent(s.roll)} />)
          }
        </div>


      </div>



      {/* ── Top 10 Centres Cards ── */}
      {centreBoard.length > 0 && (() => {
        const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0));
        const overallAvg = sorted.reduce((sum, c) => sum + (c.avg||0), 0) / (sorted.length || 1);

        return (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Left Column: Top and Bottom 5 */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
              
              {(() => {
                const topCentres = sorted.slice(0,5).map((c,i) => ({...c, rank: i+1}));
                const bottomCentres = sorted.length > 5 ? sorted.slice(-5).map((c,i) => ({...c, rank: sorted.length - 5 + i + 1})) : [];
                
                const renderCard = (c) => {
                  const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                  const medals = {1:'🥇',2:'🥈',3:'🥉'};
                  const rankDisplay = medals[c.rank] || `#${c.rank}`;
                  return (
                    <div key={c.code} style={{ padding:'8px 6px', borderRadius:8, textAlign:'center',
                      background: isAlert ? '#fef2f2' : '#f8fafc',
                      border: isAlert ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      cursor: onViewCentre ? 'pointer' : 'default' }}
                      onClick={() => onViewCentre && onViewCentre(c.code)}>
                      <div style={{ fontSize:14 }}>{rankDisplay}</div>
                      <div style={{ fontWeight:800, fontSize:12, color:'#1e293b', marginTop:2 }}>{c.code}</div>
                      <div style={{ fontSize:16, fontWeight:900, color: isAlert?'#dc2626':'#1a4fa0', marginTop:2 }}>
                        {Math.round(c.avg)}
                      </div>
                      {c.qualRate !== undefined && (
                        <div style={{ marginTop:2, fontSize:10, fontWeight:700,
                          color: c.qualRate < 80 ? '#dc2626' : '#16a34a' }}>
                          {Math.round(c.qualRate)}% Qual.
                        </div>
                      )}
                    </div>
                  );
                };

                return (
                  <>
                    <SectionTitle Icon={Star} color="#f59e0b">Top 5 Centres by Average Score</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom: bottomCentres.length > 0 ? 20 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <>
                        <SectionTitle Icon={TrendingDown} color="#dc2626">Bottom 5 Centres</SectionTitle>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
                          {bottomCentres.map(renderCard)}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Right Column: Pie Chart */}
            <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <SectionTitle Icon={PieChartIcon} color="#3b82f6">Centre Distribution</SectionTitle>
              <div style={{ flex: 1, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie 
                      data={sorted} 
                      dataKey="avg" 
                      nameKey="code" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={55} 
                      outerRadius={85} 
                      paddingAngle={1}
                      label={({ cx, cy, midAngle, outerRadius, name, index }) => {
                        const RADIAN = Math.PI / 180;
                        // Alternate radius to prevent overlapping
                        const radius = outerRadius + 12 + (index % 2 === 0 ? 0 : 14);
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
                        <Cell key={`cell-${index}`} fill={(entry.avg||0) >= overallAvg ? '#3b82f6' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [Math.round(value), `Centre ${name}`]} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
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
          </div>
        );
      })()}
    </div>
  );
}
