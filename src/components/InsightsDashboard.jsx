import { useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag
} from 'lucide-react';

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

function RankRow({ rank, name, center, score, idx }) {
  const [fg, bg] = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const medals = { 1:'🥇', 2:'🥈', 3:'🥉' };
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px',
      borderRadius:8, background: rank % 2 === 0 ? '#f8fafc' : '#fff',
      marginBottom:4, border:'1px solid #f1f5f9' }}>
      <div style={{ width:24, textAlign:'center', fontSize:14, fontWeight:800, flexShrink:0,
        color: rank <= 3 ? '#f59e0b' : '#94a3b8' }}>{medals[rank] || `#${rank}`}</div>
      <div style={{ width:36, height:36, borderRadius:'50%', background:bg,
        color:fg, fontWeight:800, fontSize:13, display:'flex', alignItems:'center',
        justifyContent:'center', flexShrink:0, border:'2px solid rgba(0,0,0,0.07)' }}>
        {rank === 1 ? '🌟' : getInitials(name)}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'#1e293b',
          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
        <div style={{ fontSize:11, color:'#64748b' }}>{center}</div>
      </div>
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

export default function InsightsDashboard({ data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey }) {
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
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc' }}>
          <SectionTitle Icon={Trophy} color="#f59e0b">🏆 Top 5 Students — {selectedTestKey||'Overall'}</SectionTitle>
          {top5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : top5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i}/>)
          }
        </div>

        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #fee2e2' }}>
          <SectionTitle Icon={AlertTriangle} color="#dc2626">⚠️ Needs Attention — Lowest Scores</SectionTitle>
          {bottom5.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>No data available</div>
            : bottom5.map((s,i) => <RankRow key={s.roll||i} rank={i+1} name={s.name||s.roll||'—'}
                center={s.center||'—'} score={s.marks??s.score} idx={i}/>)
          }
        </div>
      </div>

      {/* ── Centre Health + Student Dist + Category ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>

        {/* Centre Health */}
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
          <SectionTitle Icon={Flag} color="#1a4fa0">Centre Health</SectionTitle>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            <div style={{ flex:1, textAlign:'center', padding:'10px 6px', background:'#f0fdf4',
              borderRadius:10, border:'1px solid #bbf7d0' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#16a34a' }}>{healthyCentres.length}</div>
              <div style={{ fontSize:11, color:'#16a34a', fontWeight:600 }}>On Track ✅</div>
            </div>
            <div style={{ flex:1, textAlign:'center', padding:'10px 6px', background:'#fef2f2',
              borderRadius:10, border:'1px solid #fecaca' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#dc2626' }}>{redFlagCentres.length}</div>
              <div style={{ fontSize:11, color:'#dc2626', fontWeight:600 }}>Action Required 🚨</div>
            </div>
          </div>
          {redFlagCentres.slice(0,5).map((c,i) => (
            <div key={c.code} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'5px 8px', borderRadius:7, marginBottom:4, background:'#fef9f9', border:'1px solid #fee2e2' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#dc2626', flexShrink:0 }}/>
                <span style={{ fontSize:13, fontWeight:700, color:'#1e293b' }}>{c.code}</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{ fontSize:11, background:'#ffe4e6', color:'#dc2626',
                  padding:'2px 7px', borderRadius:20, fontWeight:700 }}>Avg:{Math.round(c.avg)}</span>
                {c.qualRate !== undefined && (
                  <span style={{ fontSize:11, background:'#fef3c7', color:'#92400e',
                    padding:'2px 7px', borderRadius:20, fontWeight:700 }}>{Math.round(c.qualRate)}%</span>
                )}
              </div>
            </div>
          ))}
          {redFlagCentres.length > 5 && (
            <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:6 }}>
              +{redFlagCentres.length - 5} more centres need attention
            </div>
          )}
        </div>

        {/* Student Distribution */}
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
          <SectionTitle Icon={Users} color="#1a4fa0">Student Distribution</SectionTitle>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:8,
            textTransform:'uppercase', letterSpacing:0.5 }}>Gender</div>
          <ProgressBar value={maleCount}   max={totalStudents} color="#1a4fa0" bg="#e8f0fc" label="Male"   count={maleCount}/>
          <ProgressBar value={femaleCount} max={totalStudents} color="#db2777" bg="#fce7f3" label="Female" count={femaleCount}/>
          {(totalStudents-maleCount-femaleCount) > 0 && (
            <ProgressBar value={totalStudents-maleCount-femaleCount} max={totalStudents}
              color="#94a3b8" bg="#f1f5f9" label="Other" count={totalStudents-maleCount-femaleCount}/>
          )}
          <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginTop:14, marginBottom:8,
            textTransform:'uppercase', letterSpacing:0.5 }}>Stream</div>
          <ProgressBar value={jeeCount}  max={totalStudents} color="#1a4fa0" bg="#e8f0fc" label="JEE"  count={jeeCount}/>
          <ProgressBar value={neetCount} max={totalStudents} color="#16a34a" bg="#e6f5ed" label="NEET" count={neetCount}/>
        </div>

        {/* Category + Top States */}
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
          <SectionTitle Icon={BookOpen} color="#7c3aed">Category Breakdown</SectionTitle>
          {catEntries.map(([cat,count],i) => {
            const colors = ['#1a4fa0','#16a34a','#b45309','#7c3aed','#0891b2','#dc2626'];
            const bgs    = ['#e8f0fc','#e6f5ed','#fff3e0','#f3f0ff','#e0f7fa','#fef2f2'];
            return <ProgressBar key={cat} value={count} max={totalStudents}
              color={colors[i%colors.length]} bg={bgs[i%bgs.length]} label={cat} count={count}/>;
          })}
          {topStates.length > 0 && <>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginTop:14, marginBottom:8,
              textTransform:'uppercase', letterSpacing:0.5 }}>Top States</div>
            {topStates.map(([state,count]) => (
              <div key={state} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'4px 0', borderBottom:'1px solid #f1f5f9' }}>
                <span style={{ fontSize:12, color:'#475569', fontWeight:600 }}>{state}</span>
                <span style={{ fontSize:12, fontWeight:800, color:'#1a4fa0',
                  background:'#e8f0fc', padding:'1px 8px', borderRadius:12 }}>{count}</span>
              </div>
            ))}
          </>}
        </div>
      </div>

      {/* ── Top 10 Centres Cards ── */}
      {centreBoard.length > 0 && (
        <div style={{ background:'#fff', borderRadius:14, padding:'18px 20px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0' }}>
          <SectionTitle Icon={Star} color="#f59e0b">⭐ Top 10 Centres by Average Score</SectionTitle>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
            {[...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).slice(0,10).map((c,i) => {
              const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
              const medals = {0:'🥇',1:'🥈',2:'🥉'};
              return (
                <div key={c.code} style={{ padding:'12px 10px', borderRadius:10, textAlign:'center',
                  background: isAlert ? '#fef2f2' : '#f8fafc',
                  border: isAlert ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                  <div style={{ fontSize:18 }}>{medals[i]||`#${i+1}`}</div>
                  <div style={{ fontWeight:800, fontSize:13, color:'#1e293b', marginTop:2 }}>{c.code}</div>
                  <div style={{ fontSize:20, fontWeight:900, color: isAlert?'#dc2626':'#1a4fa0', marginTop:2 }}>
                    {Math.round(c.avg)}
                  </div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>Avg Score</div>
                  {c.qualRate !== undefined && (
                    <div style={{ marginTop:4, fontSize:11, fontWeight:700,
                      color: c.qualRate < 80 ? '#dc2626' : '#16a34a' }}>
                      {Math.round(c.qualRate)}% Qual.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
