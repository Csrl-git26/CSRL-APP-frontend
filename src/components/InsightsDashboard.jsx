import { useMemo, useState } from 'react';
import SubjectTopCentres from './SubjectTopCentres';
import SubjectTopStudents from './SubjectTopStudents';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon
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
  return (
    <div style={{ position: 'relative', paddingBottom: 8, marginBottom: 14 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, 
        fontSize:15, fontWeight:800, color: '#0f172a', letterSpacing:0.2, whiteSpace: 'nowrap' }}>
        <Icon size={18} color={color} />{children}
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

function KpiCard({ icon: Icon, value, label, sub, bg, color, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', background:bg, borderRadius:16, padding:'14px 18px', display:'flex',
      alignItems:'center', gap:12, boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05)', flex:1, minWidth:0 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:color+'22',
        display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={22} color={color}/>
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
       fontSize={8} 
       fontWeight={700} 
       textAnchor="middle" 
       dominantBaseline="central"
       transform={isThin ? `rotate(-90, ${cx}, ${cy})` : ''}
    >
      {prefix}{val}
    </text>
  );
};




const renderPieShape = (props, activeIndex) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, index } = props;
  const isActive = activeIndex === index;
  
  const currentOuter = isActive ? outerRadius + 4 : outerRadius;
  const shadow = isActive ? 'drop-shadow(0px 4px 8px rgba(0,0,0,0.25)) brightness(1.15)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))';
  
  return (
    <g style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={4} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={4} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};

const InteractivePieChart = ({ sorted, cutoff, compareKey, onViewCentre }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  return (
    <PieChart>
      <defs>
        <linearGradient id="bar3DVertical" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="30%" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.2} />
        </linearGradient>
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
        isAnimationActive={false}
        shape={(props) => renderPieShape(props, activeIndex)}
        onMouseEnter={(_, index) => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(-1)}
        onClick={(entry) => onViewCentre && onViewCentre(entry.code || entry.payload?.code)}
        style={{ cursor: 'pointer' }}
        label={({ cx, cy, midAngle, outerRadius, payload, index }) => {
          const RADIAN = Math.PI / 180;
          const radius = outerRadius + 15;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);
          const val = sorted[index]?.[compareKey] || 0;
          const isAbove = val >= cutoff;
          const textRotation = -midAngle + (x < cx ? 180 : 0);
          const isActive = index === activeIndex;
          return (
            <text x={x} y={y} fill={isAbove ? '#3b82f6' : '#f97316'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={isActive ? 11 : 9} fontWeight={isActive ? 900 : 600} transform={`rotate(${textRotation}, ${x}, ${y})`}>
              {payload?.code || ""}
            </text>
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
      <Tooltip 
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload;
            const val = data[compareKey] || 0;
            const isAbove = val >= cutoff;
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
  const shadow = isActive ? 'drop-shadow(0px 6px 12px rgba(0,0,0,0.3)) brightness(1.2)' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))';
  
  const handleClick = (e) => {
    e.stopPropagation();
    const id = name || payload?.name;
    if (onViewCentre && id) onViewCentre(id);
  };
  
  return (
    <g 
      style={{ filter: shadow, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
      onMouseEnter={() => setActiveRadialIndex(index)}
      onMouseLeave={() => setActiveRadialIndex(null)}
      onClick={handleClick}
    >
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill={fill} cornerRadius={10} />
      <Sector cx={cx} cy={cy} innerRadius={currentInner} outerRadius={currentOuter} startAngle={startAngle} endAngle={endAngle} fill="url(#bar3DVertical)" cornerRadius={10} style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </g>
  );
};

export default function InsightsDashboard({ testInsights, data, overview, topRanked, bottomRanked, centreBoard, selectedTestKey, onViewStudent, onViewCentre, onActiveCentresClick, onTotalStudentsClick }) {
  const [activeStudentBar, setActiveStudentBar] = useState(null);
  const [activeRadialIndex, setActiveRadialIndex] = useState(null);
  const [showBottom5Qual, setShowBottom5Qual] = useState(false);
  const profiles = data?.profiles || [];
  const tests    = data?.tests    || [];

  
  const renderStudentChart = (students, title, icon, color) => {
    return (
        <div style={{ background:'#fff', borderRadius:14, padding: 20,
          boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e8f0fc', flex: 1, minWidth: 0 }}>
          <SectionTitle Icon={icon} color={color}>{title}</SectionTitle>
          {students.length === 0
            ? <div style={{ color:'#94a3b8', fontSize:13, padding:'20px 0', textAlign:'center' }}>Select a test to see rankings</div>
            : (() => {
                const chartData = students.map(s => {
                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0].substring(0, 5); // truncate to 8 chars
                   if (shortName.length < 3 && nameSplit.length > 1) {
                       shortName += ' ' + nameSplit[1].substring(0, 3);
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
                      <text x={-5} y={-4} textAnchor="end" fill="#64748b" fontSize={9} fontWeight={700}>{name} {extra}</text>
                      <text x={-5} y={8} textAnchor="end" fill="#1e293b" fontSize={10} fontWeight={900}>{total}</text>
                    </g>
                  );
                };
                
                return (
                  <div style={{ height: 210, width: '100%', marginTop: 8 }}>
                    <ResponsiveContainer width="100%" height={210}>
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
                        <XAxis type="number" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={renderCustomTick} interval={0} width={95} />

                        <Bar shape={(props) => renderStudentBarShape(props, "Physics", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Physics"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Physics" stackId="a" fill="#3b82f6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Physics_orig" content={(props) => <CustomBarLabel {...props} prefix="P" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Chemistry", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Chemistry"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Chemistry" stackId="a" fill="#8b5cf6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Chemistry_orig" content={(props) => <CustomBarLabel {...props} prefix="C" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Math", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Math"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Math" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Math_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Mathematics", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Mathematics"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Mathematics" stackId="a" fill="#0ea5e9" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Mathematics_orig" content={(props) => <CustomBarLabel {...props} prefix="M" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Biology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Biology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Biology" stackId="a" fill="#ec4899" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Biology_orig" content={(props) => <CustomBarLabel {...props} prefix="B" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Botany", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Botany"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Botany" stackId="a" fill="#14b8a6" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
                          <LabelList dataKey="Botany_orig" content={(props) => <CustomBarLabel {...props} prefix="Bo" />} />
                        </Bar>
                        <Bar shape={(props) => renderStudentBarShape(props, "Zoology", title, activeStudentBar)} onMouseEnter={(_, index) => setActiveStudentBar({chartId: title, index, dataKey: "Zoology"})} onMouseLeave={() => setActiveStudentBar(null)} dataKey="Zoology" stackId="a" fill="#f59e0b" barSize={24} isAnimationActive={false} onClick={(data) => onViewStudent && onViewStudent(data.studentId)} style={{ cursor: 'pointer' }}>
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
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── KPI Cards ── */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
        <KpiCard icon={Users}    value={totalStudents} label="Total Stud" onClick={onTotalStudentsClick}
           bg="#f0f5ff" color="#1a4fa0"/>
        <KpiCard icon={BarChart3} value={centreBoard.length} label="Active CNT" onClick={onActiveCentresClick}
          sub={`${redFlagCentres.length} need attention`} bg="linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)" color="#b45309"/>
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
          sub={topCentre ? `Best: ${topCentre.code} (${Math.round(topCentre.avg)})` : ''} bg="linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)" color="#7c3aed"/>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: centreBoard.length > 0 ? 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 20 }}>
        {/* Left Column: Stacked Students & Centres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
      {/* Stacked Top 10 Centres ── */}
      {centreBoard.length > 0 && (() => {
        const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).map(c => ({...c, equalSlice: 1}));
        return (
            <div style={{ background:'#fff', borderRadius:16, padding: 20,
              boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)', border:'1px solid #f1f5f9' }}>
              
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
                    <SectionTitle Icon={Star} color="#2563eb">Top 5 CNT - Avg Score</SectionTitle>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2, marginBottom: bottomCentres.length > 0 ? 32 : 0 }}>
                      {topCentres.map(renderCard)}
                    </div>
                    
                    {bottomCentres.length > 0 && (
                      <>
                        <SectionTitle Icon={Star} color="#2563eb">Bottom 5 CNT - Avg Score</SectionTitle>
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


        </div> {/* Close Stacked Left Column */}
            
        {/* Middle Column: Radial Progress Chart */}
        <div style={{ background:'#fff', borderRadius:16, padding: 20, boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05)', border:'1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SectionTitle Icon={PieChartIcon} color="#2563eb">
              {showBottom5Qual ? 'Bottom 5 CNT - Qual\u00A0%' : 'Top 5 CNT - Qual\u00A0%'}
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
                    cx="40%" cy="50%" 
                    innerRadius="30%" outerRadius="90%" 
                    barSize={10} 
                    data={radialData}
                    startAngle={90} endAngle={-270}
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
                      isAnimationActive={false}
                      minAngle={15} 
                      background={{ fill: '#f1f5f9' }} 
                      clockWise={true} 
                      dataKey="value" 
                      shape={(props) => renderRadialBarShape(props, activeRadialIndex, onViewCentre, setActiveRadialIndex)}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 700, formatter: (val) => `${val}%`, pointerEvents: 'none' }}
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
            const sorted = [...centreBoard].sort((a,b) => (b.avg||0)-(a.avg||0)).map(c => ({...c, equalSlice: 1}));
            const overallAvg = sorted.reduce((sum, c) => sum + (c.avg||0), 0) / (sorted.length || 1);
            return (
            <div style={{ background:'#fff', borderRadius:16, padding: 20,
              boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)', border:'1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <SectionTitle Icon={PieChartIcon} color="#2563eb">CNT Dist. - Total Avg Score</SectionTitle>
              <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <InteractivePieChart sorted={sorted} cutoff={overallAvg} compareKey="avg" onViewCentre={onViewCentre} />
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Above Avg</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>Below Avg</span>
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
            <div style={{ background:'#fff', borderRadius:16, padding: 20,
              boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)', border:'1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <SectionTitle Icon={PieChartIcon} color="#2563eb">CNT Dist. - Qual.</SectionTitle>
              <div style={{ flex: 1, minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <InteractivePieChart sorted={sorted} cutoff={80} compareKey="qualRate" onViewCentre={onViewCentre} />
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 15, fontSize: 13, color: '#475569', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>&ge; 80% Qual</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f97316', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>&lt; 80% Qual</span>
                  </div>
                </div>
              </div>
            </div>
          );
      })()}
      


      {/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      
      {/* Subject Top 3 Students */}
      <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />

      {/* Top & Bottom 5 Students (Each taking 1 column in the 4-col grid) */}
      {renderStudentChart(top5, 'Top 5 Stud', Trophy, '#2563eb')}
      {renderStudentChart(bottom5, 'Bottom 5 Stud', Star, '#2563eb')}

      </div> {/* End Main Dashboard Layout */}

    </div>
  );
}
