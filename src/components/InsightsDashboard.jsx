/* eslint-disable */
import { useMemo, useState, useEffect } from 'react';
import SubjectTopStudents from './SubjectTopStudents';
import SubjectTopCentres from './SubjectTopCentres';

import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon, RefreshCcw
} from 'lucide-react';
import { Rectangle, Sector, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

function pct(n, d) { return !d ? 0 : Math.round((n / d) * 100); }

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

const AVATAR_COLORS = [
  ['#1a4fa0', '#e8f0fc'], ['#1a6e3b', '#e6f5ed'], ['#b45309', '#fff3e0'],
  ['#7c3aed', '#f3f0ff'], ['#0891b2', '#e0f7fa'],
];

function SectionTitle({ Icon, children, color = '#3b82f6' }) {

  const renderQualCardSide = (isBottom5) => {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', backfaceVisibility: 'hidden', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle Icon={PieChartIcon} color="#2563eb">
            {isBottom5 ? 'BOTTOM 5 CENTRE - QUAL' : 'TOP 5 CENTRE - QUAL %'}
          </SectionTitle>
          <div 
            onClick={() => setShowBottom5Qual(!showBottom5Qual)}
            style={{ cursor: 'pointer', padding: 6, background: '#eff6ff', borderRadius: '50%', color: '#3b82f6', transition: 'all 0.2s', display: 'flex' }}
            title={`Flip to ${isBottom5 ? 'Top 5' : 'Bottom 5'}`}
          >
            <RefreshCcw size={16} />
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {(() => {
            if (!centreBoard || centreBoard.length === 0) return <div>No Data</div>;
            const sortedByQual = [...centreBoard].sort((a,b) => (b.qualRate||0) - (a.qualRate||0));
            const top5Qual = isBottom5 ? sortedByQual.slice(-5) : sortedByQual.slice(0, 5);
            
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
            const radialData = top5Qual.map((c, i) => {
              const rank = sortedByQual.findIndex(x => x.code === c.code) + 1;
              return { name: c.code, value: Math.round(c.qualRate || 0), fill: colors[i % colors.length], rank };
            }).reverse();
            
            const legendPayload = top5Qual.map((c, i) => {
              const rank = sortedByQual.findIndex(x => x.code === c.code) + 1;
              return { value: `${rank}. ${c.code}`, type: 'square', color: colors[i % colors.length] };
            });

            return (
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart 
                  cx="40%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} 
                  data={radialData} startAngle={90} endAngle={-270}
                >
                  <defs>
                    <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                      <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar 
                    isAnimationActive={true} animationDuration={2000} animationEasing="ease-out" minAngle={15} background={{ fill: '#f1f5f9' }} clockWise={true} dataKey="value" 
                    shape={(props) => renderRadialBarShape(props, activeRadialIndex, onViewCentre, setActiveRadialIndex)}
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%`, pointerEvents: 'none' }}
                  />
                  <Legend 
                    layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} 
                    content={(props) => (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {legendPayload.map((entry, index) => (
                          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 11, color: '#1e3a8a', fontWeight: 900, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 1px 3px rgba(30,58,138,0.2)' }}>
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
    );
  };

  return (

    <div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap' }}>
        
        <span style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 0.2,
          color: 'rgba(37, 99, 235, 0.95)',
          textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)',
        }}>
          {children}
        </span>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 2,
        background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), transparent)',
        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)'
      }} />
    </div>
  );
}

function KpiCard({ icon: Icon, value, label, sub, bg, color, onClick, labelFontSize = 14, valueColor, subColor, progressBar }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="card" onClick={onClick} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', cursor: onClick ? 'pointer' : 'default', background:bg, padding:'14px 18px', display:'flex',
      alignItems:'center', gap:12, flex:1, minWidth:0 }}>
      
      {isHovered && progressBar && (
        <div style={{
          position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
          background: '#1a4fa0', color: 'white', padding: '4px 10px', borderRadius: 6,
          fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, whiteSpace: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: progressBar.color || color }} />
            <span>{progressBar.value}</span>
          </div>
          <span style={{ color: '#94a3b8' }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} />
            <span>{progressBar.max}</span>
          </div>
          {progressBar.tooltipText && <span style={{ marginLeft: 2, color: '#cbd5e1', fontWeight: 600 }}>{progressBar.tooltipText}</span>}
          <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 8, height: 8, background: '#1a4fa0' }} />
        </div>
      )}

      <div style={{ width:42, height:42, borderRadius:12, background:color+'22',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={22} color={color}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
        {progressBar && (
          <div style={{ width: '100%', height: 5, background: '#cbd5e1', borderRadius: 3, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ width: `${(progressBar.value / progressBar.max) * 100}%`, height: '100%', background: progressBar.color || color, borderRadius: 3 }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontSize:22, fontWeight:900, color: valueColor || color, lineHeight:1.1, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>{value}</div>
          <div style={{ fontSize:labelFontSize, fontWeight:800, color:'#334155', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>{label}</div>
        </div>
        {sub && <div style={{ fontSize:13, fontWeight:600, color: subColor || '#64748b', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>{sub}</div>}
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
        <div style={{ fontSize:10, fontWeight:700, color:'#1e3a8a', whiteSpace:'nowrap', flexShrink:0 }}>{name}</div>
        <div style={{ fontSize:8, color: subColor || '#64748b', fontWeight:600, flexShrink:0 }}>{center}</div>
        
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


const CustomBarLabel = (props) => {
  const { x, y, width, height, value, prefix } = props;
  
  // In Recharts with , `value` is passed as an array [base, current]
  let val = value;
  if (Array.isArray(value)) {
    val = value[1] - value[0]; // Recover the original value
  }
  
  if (!val || val === 0) return null;
  
  const absWidth = Math.abs(width);
  
  // Hide completely if less than 6 pixels wide
  if (absWidth < 6) return null;

  const cx = x + width / 2;
  const cy = y + height / 2;
  
  // Rotate 90 degrees if it's too thin to fit horizontal text
  const isThin = absWidth < 18;

  return (
    <text 
       x={cx} 
       y={cy} 
       fill="#fff" 
       fontSize={10} 
       fontWeight={900} 
       textAnchor="middle" 
       dominantBaseline="central"
       style={{ filter: 'drop-shadow(1px 2px 0px rgba(37,99,235,0.7))' }}
       transform={isThin ? `rotate(-90, ${cx}, ${cy})` : ''}
    >
      {prefix}{val}
    </text>
  );
};




const renderPieShape = (props, activeIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
  const isActive = activeIndex === index;
  const isBlue = fill === '#3b82f6';

  const currentOuter = isActive ? outerRadius + 6 : outerRadius;
  const depthOffset = isActive ? 6 : 4;

  // Darker colors for the 3D side/depth layer
  const depthFill = isBlue ? '#1e40af' : '#c2410c';

  const glowColor = isBlue ? 'rgba(59,130,246,0.7)' : 'rgba(249,115,22,0.7)';
  const shadow = isActive
    ? `drop-shadow(0px 0px 10px ${glowColor}) drop-shadow(0px 8px 14px rgba(0,0,0,0.45)) brightness(1.25)`
    : `drop-shadow(0px 4px 7px rgba(0,0,0,0.28)) brightness(1.06)`;

  return (
    <g style={{ filter: shadow, transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      {/* 3D depth/side layer — darker, shifted down to create elevation */}
      <Sector cx={cx} cy={cy + depthOffset} innerRadius={innerRadius - 1} outerRadius={currentOuter + 1}
        startAngle={startAngle} endAngle={endAngle} fill={depthFill} cornerRadius={6} opacity={0.85} />
      {/* Main top-face layer */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter}
        startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={6} />
      {/* Top-light gloss overlay */}
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter}
        startAngle={startAngle} endAngle={endAngle} fill="url(#pieGloss)" cornerRadius={6}
        style={{ mixBlendMode: 'overlay', pointerEvents: 'none', opacity: 0.75 }} />
    </g>
  );
};

const InteractivePieChart = ({ sorted, cutoff, compareKey, onViewCentre }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  useEffect(() => { setShouldAnimate(true); const t = setTimeout(() => setShouldAnimate(false), 2500); return () => clearTimeout(t); }, []);
  return (
    <PieChart>
      <defs>
        <linearGradient id="pieGloss" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="40%" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.15} />
        </linearGradient>
        <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      <Pie 
        data={sorted} 
        dataKey="equalSlice"
        startAngle={180}
        endAngle={-180} 
        nameKey="code" 
        cx="50%" 
        cy="50%" 
        innerRadius={35} 
        outerRadius={55} 
        paddingAngle={3}
        activeIndex={activeIndex}
        isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out"
        shape={(props) => renderPieShape(props, activeIndex)}
        onMouseEnter={(_, index) => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(-1)}
        onClick={(entry) => onViewCentre && onViewCentre(entry.code || entry.payload?.code)}
        style={{ cursor: 'pointer' }}
        label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius + 3;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          const val = sorted[index]?.[compareKey] || 0;
          const isAbove = val >= cutoff;
          const textRotation = -midAngle + (x < cx ? 180 : 0);
          const isActive = index === activeIndex;
          const lx = x, ly = y;
          const lFill = isAbove ? '#3b82f6' : '#f97316';
          const lSize = 11;
          const lAnchor = x > cx ? 'start' : 'end';
          const transform = `rotate(${textRotation}, ${lx}, ${ly})`;
          return (
            <g transform={transform}>
              <text x={lx} y={ly} fill={lFill} textAnchor={lAnchor} dominantBaseline="central"
                fontSize={isActive ? 12 : 11} fontWeight={900} letterSpacing="0.5px"
                stroke="#ffffff" strokeWidth={2.5} strokeLinejoin="round" paintOrder="stroke">
                {payload?.code || ""}
                {isActive && <tspan fontSize={9.5}> ({Math.round(val)}{compareKey === 'qualRate' ? '%' : ''})</tspan>}
              </text>
            </g>
          );
        }}
        labelLine={false}
      >
        {sorted.map((entry, index) => {
           const val = entry[compareKey] || 0;
           const isAbove = val >= cutoff;
           return (
          <Cell 
            key={`cell-${index}`} 
            fill={isAbove ? '#3b82f6' : '#f97316'} 
            style={{ cursor: onViewCentre ? 'pointer' : 'default', outline: 'none' }}
            onClick={() => onViewCentre && onViewCentre(entry.code)}
          />
        )})}
      </Pie>
    </PieChart>
  );
};



const renderStudentBarShape = (props, dataKey, chartId, activeStudentBar) => {
  const { fill, x, y, width, height, index } = props;
  const isActive = activeStudentBar && activeStudentBar.chartId === chartId && activeStudentBar.index === index;
  
  let radius = [0, 0, 0, 0];
  if (dataKey === "Physics") {
    radius = [6, 0, 0, 6];
  } else if (dataKey === "Math" || dataKey === "Mathematics" || dataKey === "Zoology" || dataKey === "Biology") {
    radius = [0, 6, 6, 0];
  }

  const adjustedX = x;
  const adjustedWidth = Math.max(0, width);
  
  const adjustedY = isActive ? y - 2 : y;
  const adjustedHeight = isActive ? height + 4 : height;
  
  return (
    <g>
      <Rectangle x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill={fill} radius={radius} style={{ filter: isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      <Rectangle x={adjustedX} y={adjustedY} width={adjustedWidth} height={adjustedHeight} fill="url(#bar3D)" radius={radius} style={{ transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', pointerEvents: 'none', mixBlendMode: 'overlay' }} />
    </g>
  );
};

const renderRadialBarShape = (props, activeRadialIndex, onViewCentre, setActiveRadialIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index, name, payload } = props;
  const isActive = activeRadialIndex === index;
  
  const currentInner = isActive ? innerRadius - 2 : innerRadius;
  const currentOuter = isActive ? outerRadius + 4 : outerRadius;
  const shadow = isActive ? 'drop-shadow(0px 8px 16px rgba(0,0,0,0.4)) brightness(1.2)' : 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.05)';
  
  const handleClick = (e) => {
    e.stopPropagation();
    const id = name || payload?.name;
    if (onViewCentre && id) onViewCentre(id);
  };
  
  const midRadius = currentInner + (currentOuter - currentInner) / 2;
  const radian = -(startAngle * Math.PI) / 180;
  const textX = cx;
  const textY = cy + midRadius * Math.sin(radian);

  return (
    <g 
      style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
      onMouseEnter={() => setActiveRadialIndex(index)}
      onMouseLeave={() => setActiveRadialIndex(null)}
      onClick={handleClick}
    >
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={12} stroke="#ffffff" strokeWidth={1} strokeOpacity={0.8} />
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={12} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
      <text
        x={textX}
        y={textY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#1e3a8a"
        fontSize={11}
        fontWeight={900}
        letterSpacing="-0.5px"
        style={{ filter: 'drop-shadow(0px 1px 1.5px rgba(255,255,255,1))', pointerEvents: 'none' }}
      >
        {payload.value}%
      </text>
    </g>
  );
};

export default function InsightsDashboard({ testInsights, data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre, onActiveCentresClick, onTotalStudentsClick }) {
    const [showRankingModal, setShowRankingModal] = useState(false);
  const [activeStudentBar, setActiveStudentBar] = useState(null);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [activeRadialIndex, setActiveRadialIndex] = useState(null);
  const [showBottom5Qual, setShowBottom5Qual] = useState(false);
  useEffect(() => { setShouldAnimate(true); const t = setTimeout(() => setShouldAnimate(false), 2500); return () => clearTimeout(t); }, [showBottom5Qual, selectedTestKey]);
  const profiles = data?.profiles || [];
  const tests    = data?.tests    || [];

  
  const renderLowScorersCount = (insights) => {
    const subjects = Object.keys(insights?.notQualifiedBySubject || {});
    return (
      <div className="card" style={{ padding: 20, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <SectionTitle Icon={AlertTriangle} color="#2563eb"><span style={{ fontSize: 11 }}>STUDENT NO. SUBJECTWISE MARKS &lt;=30</span></SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, subjects.length)}, 1fr)`, gap: 12, flex: 1 }}>
          {subjects.map((sub) => (
            <div key={sub} style={{ background: '#f8fafc', borderRadius: 8, padding: 8, minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a4fa0', fontSize: 14 }}>{sub}</div>
              <ul className="custom-scrollbar" style={{ margin: 0, paddingLeft: 12, fontSize: 11, lineHeight: 1.7, maxHeight: 130, overflowY: 'auto', paddingRight: 2 }}>
                {Object.entries((insights.notQualifiedBySubject || {})[sub] || {})
                  .filter(([, n]) => n > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, n]) => (
                    <li 
                      key={code} 
                      onClick={() => onViewCentre && onViewCentre(code)}
                      style={{ color: '#2563eb', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline transparent', transition: 'text-decoration 0.2s', display: 'flex', justifyContent: 'space-between', gap: 4 }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'underline transparent'}
                    >
                      <span style={{ color: '#2563eb' }}>{code}</span>
                      <span style={{ color: '#f97316', fontWeight: 700 }}>{n}</span>
                    </li>
                  ))}
                {!Object.values((insights.notQualifiedBySubject || {})[sub] || {}).some((n) => n > 0) && (
                  <li style={{ color: '#94a3b8' }}>None</li>
                )}
              </ul>
            </div>
          ))}
          {subjects.length === 0 && (
             <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center', gridColumn:'1/-1' }}>No marks data available</div>
          )}
        </div>
      </div>
    );
  };

  const renderStudentChart = (students, title, icon, color, fixedMax = false) => {
    return (
        <div className="card" style={{ padding: 20, flex: 1, minWidth: 0 }}>
          <SectionTitle Icon={icon} color={color}>{title}</SectionTitle>
          {students.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : (() => {
                const chartData = students.map(s => {
                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0].substring(0, 12); // truncate to 12 chars
                   if (shortName.length < 3 && nameSplit.length > 1) {
                       shortName += ' ' + nameSplit[1].substring(0, 5);
                   }
                   const centre = s.center || '';
                   const label = centre ? `${shortName} (${centre})` : shortName;
                   
                   let d = { studentId: s.roll || s.id, name: label, total: s.marks ?? s.score };
                   ['Physics','Chemistry','Math','Mathematics','Biology','Botany','Zoology'].forEach(sub => {
                       d[sub] = 0;
                       d[`${sub}_orig`] = 0;
                   });
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
                             let val = Number(s.rawScores[matchedKey]);
                             d[sub] = Math.abs(val); // Always positive for linear right-stacking
                             d[`${sub}_orig`] = val; // Store original for label
                          }
                      });
                   }
                   return d;
                });
                
                const renderCustomTick = (props) => {
                  const { x, y, payload } = props;
                  const nameParts = payload.value.split(' (');
                  const name = nameParts[0];
                  const extra = nameParts.length > 1 ? '(' + nameParts[1] : '';
                  const studentData = chartData.find(d => d.name === payload.value);
                  const total = studentData?.total || '';
                  const studentId = studentData?.studentId;
                  return (
                    <g transform={`translate(${x},${y})`} onClick={() => { if(onViewStudent && studentId) onViewStudent(studentId); }} style={{ cursor: 'pointer' }}>
                      <rect x={-90} y={-15} width={90} height={30} fill="transparent" />
                      <text x={-5} y={-4} textAnchor="end" fill="#1e3a8a" fontSize={10} fontWeight={900} letterSpacing="0.5px" style={{ textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 1px 3px rgba(30,58,138,0.2)' }}>{name} {extra}</text>
                      <text x={-5} y={9} textAnchor="end" fill="#1e3a8a" fontSize={11} fontWeight={900} letterSpacing="0.5px" style={{ textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 1px 3px rgba(30,58,138,0.2)' }}>{total}</text>
                    </g>
                  );
                };
                
                return (
                  <div style={{ height: 180, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart 
                        data={chartData} 
                        layout="vertical" 
                        margin={{ top: 10, right: 20, left: 5, bottom: 5 }} 
                        
                        onClick={(e) => {
                          if (e && e.activePayload && e.activePayload.length > 0 && e.activePayload[0].payload.studentId) {
                            if (onViewStudent) onViewStudent(e.activePayload[0].payload.studentId);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <defs>
                          <linearGradient id="bar3D" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} />
                            <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis type="number" domain={fixedMax ? [0, 360] : ['auto', 'auto']} ticks={fixedMax ? [0, 60, 120, 180, 240, 300, 360] : undefined} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={95} />

                        <Bar shape={(props) => renderStudentBarShape(props, "Physics", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Physics"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Physics" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Physics_orig" content={(props) => <CustomBarLabel {...props} prefix="P" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Chemistry", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Chemistry"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Chemistry" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Chemistry_orig" content={(props) => <CustomBarLabel {...props} prefix="C" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Math", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Math"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Math" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Math_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Mathematics", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Mathematics"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Mathematics" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Mathematics_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Biology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Biology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_orig" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Botany", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Botany"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Botany" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Botany_orig" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Zoology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Zoology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Zoology" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={shouldAnimate} animationDuration={2000} animationEasing="ease-out" onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Zoology_orig" content={(props) => <CustomBarLabel {...props} prefix="Z" />} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })()
          }
        </div>
    );
  };

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
    <div style={{ display:'flex', flexDirection:'column', gap:20, position: 'relative' }}>

      {/* ── KPI Cards ── */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        <KpiCard icon={Users}    value={totalStudents} label="TOTAL STUDENT" onClick={onTotalStudentsClick}
           progressBar={{ value: totalQualified, max: totalStudents, color: '#3b82f6', tooltipText: 'Qualified / Total Student' }}
           bg="#f0f5ff" color="#1a4fa0"/>
        <KpiCard icon={BarChart3} value={centreBoard.length} label="ACTIVE CENTRE" onClick={onActiveCentresClick}
          progressBar={{ value: centreBoard.length - redFlagCentres.length, max: centreBoard.length, color: '#3b82f6', tooltipText: 'OK Centres / Total Centres' }}
          bg="#f0f5ff" color="#1a4fa0"/>
        <KpiCard 
          icon={Award}    
          value={qualRate !== null ? `${qualRate}%` : '—'} 
          label="CSRL QUALIFICATION"
          labelFontSize={12}
          progressBar={{ value: totalQualified, max: totalAppeared, color: '#3b82f6', tooltipText: 'Qualified / Appeared' }}
          bg="#f0f5ff" 
          color="#1a4fa0"
        />
        <KpiCard icon={Target}   value={avgScore !== null ? avgScore : '—'}
          label={`Avg Score (${selectedTestKey||'Latest'})`}
          progressBar={{ value: avgScore || 0, max: 360, color: '#3b82f6', tooltipText: 'Avg / Max(360)' }}
          sub={topCentre ? `Best: ${topCentre.code} (${Math.round(topCentre.avg)})` : ''} bg="#f0f5ff" color="#1a4fa0"/>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 20 }}>
        {/* Left Column: Stacked Students & Centres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
      {/* Stacked Top 10 Centres ── */}
      {centreBoard.length > 0 && (() => {
        const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).map(c => ({...c, equalSlice: 1}));
        return (
            <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={() => setShowRankingModal(true)} title="Click to view full Centre Rankings">
              
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
                            style={{ animation: `drawArc-${c.code} 2s ease-out forwards` }}
                          />
                        </svg>
                        <style>{`
                          @keyframes drawArc-${c.code} {
                            from { stroke-dashoffset: ${circumference}; }
                            to { stroke-dashoffset: ${dashoffset}; }
                          }
                        `}</style>
                        <div style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: color, letterSpacing: '-0.5px' }}>
                          {score}
                        </div>
                      </div>
                      

                      <div style={{ fontSize:10, fontWeight:900, color: '#334155', display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '0.5px', textShadow: '1px 1px 0px rgba(37,99,235,0.3)' }}>
                        {medals[c.rank] && <span style={{fontSize:10, textShadow:'none'}}>{medals[c.rank]}</span>} {c.code}
                      </div>
                    </div>
                  );
                };

                return (
                  <div key={selectedTestKey}>
                    <SectionTitle Icon={Star} color="#2563eb">TOP 5 CENTRE - AVG SCORE</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom: bottomCentres.length > 0 ? 32 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <SectionTitle Icon={Star} color="#2563eb">BOTTOM 5 CENTRE - AVG SCORE</SectionTitle>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2 }}>
                          {bottomCentres.map(renderCard)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })()}


        </div> {/* Close Stacked Left Column */}
            
        {/* Middle Column: Radial Progress Chart (3D Flip Card) */}
        <div style={{ perspective: 1000, height: '100%' }}>
          <div style={{
            position: 'relative', width: '100%', height: '100%',
            transition: 'transform 1.2s ease-in-out',
            transformStyle: 'preserve-3d',
            transform: showBottom5Qual ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}>
            {/* Front Side */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <SectionTitle Icon={PieChartIcon} color="#2563eb">TOP 5 CENTRE - QUAL %</SectionTitle>
                  <div 
                    onClick={() => setShowBottom5Qual(true)}
                    style={{ cursor: 'pointer', padding: 6, background: '#eff6ff', borderRadius: '50%', color: '#3b82f6', transition: 'all 0.2s', display: 'flex', marginTop: -4 }}
                    title="Flip to Bottom 5"
                  >
                    <RefreshCcw size={16} />
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {(() => {
                    if (!centreBoard || centreBoard.length === 0) return <div>No Data</div>;
                    const sortedByQual = [...centreBoard].sort((a,b) => (b.qualRate||0) - (a.qualRate||0));
                    const top5Qual = sortedByQual.slice(0, 5);
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
                    const radialData = top5Qual.map((c, i) => ({ name: c.code, value: Math.round(c.qualRate || 0), fill: colors[i % colors.length], rank: sortedByQual.findIndex(x => x.code === c.code) + 1 })).reverse();
                    const legendPayload = top5Qual.map((c, i) => ({ value: `${sortedByQual.findIndex(x => x.code === c.code) + 1}. ${c.code}`, type: 'square', color: colors[i % colors.length] }));
                    return (
                      <ResponsiveContainer width="100%" height={180} key={`front-${showBottom5Qual}`}>
                        <RadialBarChart cx="35%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={radialData} startAngle={90} endAngle={-270}>
                          <defs>
                            <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                              <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                              <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar isAnimationActive={shouldAnimate} animationBegin={600} animationDuration={2000} animationEasing="ease-out" minAngle={15} background={{ fill: '#f1f5f9' }} clockWise={true} dataKey="value" shape={(props) => renderRadialBarShape(props, activeRadialIndex, onViewCentre, setActiveRadialIndex)} />
                          <Legend layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} content={(props) => (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {legendPayload.map((entry, index) => (
                                <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 11, color: '#1e3a8a', fontWeight: 900, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 1px 3px rgba(30,58,138,0.2)' }}>
                                  <span style={{ width: 8, height: 8, backgroundColor: entry.color, marginRight: 6, display: 'inline-block' }}></span>
                                  {entry.value}
                                </li>
                              ))}
                            </ul>
                          )} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <SectionTitle Icon={PieChartIcon} color="#2563eb">BOTTOM 5 CENTRE - QUAL</SectionTitle>
                  <div 
                    onClick={() => setShowBottom5Qual(false)}
                    style={{ cursor: 'pointer', padding: 6, background: '#eff6ff', borderRadius: '50%', color: '#3b82f6', transition: 'all 0.2s', display: 'flex', marginTop: -4 }}
                    title="Flip to Top 5"
                  >
                    <RefreshCcw size={16} />
                  </div>
                </div>
                <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {(() => {
                    if (!centreBoard || centreBoard.length === 0) return <div>No Data</div>;
                    const sortedByQual = [...centreBoard].sort((a,b) => (b.qualRate||0) - (a.qualRate||0));
                    const bottom5Qual = sortedByQual.slice(-5);
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
                    const radialData = bottom5Qual.map((c, i) => ({ name: c.code, value: Math.round(c.qualRate || 0), fill: colors[i % colors.length], rank: sortedByQual.findIndex(x => x.code === c.code) + 1 })).reverse();
                    const legendPayload = bottom5Qual.map((c, i) => ({ value: `${sortedByQual.findIndex(x => x.code === c.code) + 1}. ${c.code}`, type: 'square', color: colors[i % colors.length] }));
                    return (
                      <ResponsiveContainer width="100%" height={180} key={`back-${showBottom5Qual}`}>
                        <RadialBarChart cx="35%" cy="50%" innerRadius="30%" outerRadius="90%" barSize={10} data={radialData} startAngle={90} endAngle={-270}>
                          <defs>
                            <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
                              <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
                              <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
                            </linearGradient>
                          </defs>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar isAnimationActive={shouldAnimate} animationBegin={600} animationDuration={2000} animationEasing="ease-out" minAngle={15} background={{ fill: '#f1f5f9' }} clockWise={true} dataKey="value" shape={(props) => renderRadialBarShape(props, activeRadialIndex, onViewCentre, setActiveRadialIndex)} />
                          <Legend layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} content={(props) => (
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {legendPayload.map((entry, index) => (
                                <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 11, color: '#1e3a8a', fontWeight: 900, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 1px 3px rgba(30,58,138,0.2)' }}>
                                  <span style={{ width: 8, height: 8, backgroundColor: entry.color, marginRight: 6, display: 'inline-block' }}></span>
                                  {entry.value}
                                </li>
                              ))}
                            </ul>
                          )} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pie Chart */}
        {centreBoard.length > 0 && (() => {
            const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).map(c => ({...c, equalSlice: 1}));
            const overallAvg = sorted.reduce((sum, c) => sum + (c.avg||0), 0) / (sorted.length || 1);
            return (
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <SectionTitle Icon={PieChartIcon} color="#2563eb">CENTRE - TOTAL AVG SCORE</SectionTitle>
              <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer key={selectedTestKey} width="100%" height={180}>
                  <InteractivePieChart sorted={sorted} cutoff={overallAvg} compareKey="avg" onViewCentre={onViewCentre} />
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>Above Avg</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>Below Avg</span>
                  </div>
                </div>
              </div>
            </div>
          );
      })()}
      
      {/* Fourth Column: Qual Pie Chart */}
        {centreBoard.length > 0 && (() => {
            const sorted = [...centreBoard].sort((a,b) => (b.qualRate||0)-(a.qualRate||0)).map(c => ({...c, equalSlice: 1}));
            const overallAvg = sorted.reduce((sum, c) => sum + (c.qualRate||0), 0) / (sorted.length || 1);
            return (
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <SectionTitle Icon={PieChartIcon} color="#2563eb">CENTRE - QUALIFICATION</SectionTitle>
              <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer key={selectedTestKey} width="100%" height={180}>
                  <InteractivePieChart sorted={sorted} cutoff={80} compareKey="qualRate" onViewCentre={onViewCentre} />
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>&ge; 80% Qual</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, textShadow: '0px 1px 1px rgba(255,255,255,0.9), 0px 2px 5px rgba(37,99,235,0.4)' }}>&lt; 80% Qual</span>
                  </div>
                </div>
              </div>
            </div>
          );
      })()}
      


      



      </div> {/* End Main Dashboard Layout */}

      {/* ── Second Row: Subject & Student Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20, marginTop: 10 }}>
        <SubjectTopCentres key={selectedTestKey} centreBoard={centreBoard} onViewCentre={onViewCentre} />
        <SubjectTopStudents key={selectedTestKey} subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />
        {renderStudentChart(top5, 'TOP 5 STUDENT', Trophy, '#2563eb', true)}
        {renderLowScorersCount(testInsights)}
      </div>



      {showRankingModal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }} onClick={() => setShowRankingModal(false)}>
          <div style={{ background: '#eef2f6', borderRadius: 16, width: '100%', maxWidth: 1000, height: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: 24, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid rgba(59, 130, 246, 0.2)', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb' }}>
                <Trophy size={24} />
                <span style={{ fontSize: 22, fontWeight: 800 }}>Centre Rankings — {selectedTestKey || 'Latest'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '6px 12px', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                 <span style={{ fontWeight: 800, color: '#1e293b' }}>Test:</span>
                 <span style={{ fontWeight: 700, color: '#475569' }}>{selectedTestKey || 'Latest'}</span>
                 <span style={{ fontSize: 10 }}>▼</span>
              </div>
            </div>
            
            <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0))} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="code" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#1e293b', angle: -90, textAnchor: 'end' }} interval={0} dx={-4} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#1e293b' }} domain={[0, 180]} ticks={[0, 45, 90, 135, 180]} label={{ value: 'Average Score', angle: -90, position: 'insideLeft', style: { fontWeight: 900, fill: '#475569', fontSize: 14 } }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: '#1e293b', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                          <div style={{ marginBottom: 4, color: '#93c5fd' }}>{payload[0].payload.code}</div>
                          <div>Avg: {Math.round(payload[0].payload.avg)}</div>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="avg" fill="#1e3a8a" radius={[6, 6, 6, 6]} barSize={22}>
                    <LabelList dataKey="avg" content={(props) => {
                      const { x, y, width, value, index } = props;
                      const c = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0))[index];
                      const isAlert = c.avg < 100 || (c.qualRate??0) < 80;
                      
                      return (
                        <g>
                          <text x={x + width / 2} y={y - 12} fill="#1e293b" fontSize={11} fontWeight={900} textAnchor="middle">
                            {Math.round(value)}
                          </text>
                          {isAlert && (
                            <g>
                              <circle cx={x + width / 2} cy={y - 2} r={8} fill="rgba(239, 68, 68, 0.4)" filter="blur(3px)" />
                              <circle cx={x + width / 2} cy={y - 2} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
                            </g>
                          )}
                        </g>
                      );
                    }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
