import { useMemo, useState } from 'react';
import SubjectTopCentres from './SubjectTopCentres';
import SubjectTopStudents from './SubjectTopStudents';
import {
  Trophy, TrendingUp, TrendingDown, Users, AlertTriangle,
  BarChart3, Target, Award, BookOpen, Star, Flag, PieChart as PieChartIcon
} from 'lucide-react';
import { Sector, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

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

function KpiCard({ icon: Icon, value, label, sub, bg, color, onClick }) {
  return (
    <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', background:bg, borderRadius:10, padding:'6px 12px', display:'flex',
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




const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, midAngle } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textRotation = -midAngle + (x < cx ? 180 : 0);
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight={800} transform={`rotate(${textRotation}, ${x}, ${y})`}>
        {payload?.code || ""}
      </text>
    </g>
  );
};

const InteractivePieChart = ({ sorted, overallAvg, onViewCentre }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  return (
    <InteractivePieChart sorted={sorted} overallAvg={overallAvg} onViewCentre={onViewCentre} />
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
      


      {/* Subject Top 3 Centres */}
      <SubjectTopCentres centreBoard={centreBoard} onViewCentre={onViewCentre} />
      
      {/* Subject Top 3 Students */}
      <SubjectTopStudents subjectTopStudents={testInsights?.subjectTopStudents} onViewStudent={onViewStudent} />

      {/* Top & Bottom 5 Students (Each taking 1 column in the 4-col grid) */}
      {renderStudentChart(top5, 'Top 5 Students', Trophy, '#2563eb')}
      {renderStudentChart(bottom5, 'Bottom 5 Students', Star, '#2563eb')}

      </div> {/* End Main Dashboard Layout */}

    </div>
  );
}
