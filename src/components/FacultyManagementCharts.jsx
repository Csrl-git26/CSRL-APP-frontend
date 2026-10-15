import { useState } from 'react';
import { Users, Target, Award, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie } from 'recharts';

const blue = '#2563eb', orange = '#f97316';
const fmt = value => value == null ? '—' : Number(value.toFixed(2));
const titleStyle = {fontSize:15,fontWeight:800,color:blue,paddingBottom:10,marginBottom:16,borderBottom:'2px solid #dbeafe'};
const grid = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:20};
const numeric = value => typeof value === 'number' && Number.isFinite(value);

export function facultyBoard(rows) {
  const people = new Map();
  for (const row of rows) {
    const id = row.email;
    if (!people.has(id)) people.set(id,{id,name:row.name,marks:[],accuracy:[],known:0,qualified:0,equalSlice:1});
    const person = people.get(id);
    if (row.status !== 'APPEARED') continue;
    if (numeric(row.marks)) person.marks.push(row.marks);
    if (numeric(row.accuracy)) person.accuracy.push(row.accuracy);
    if (['QUALIFIED','NOT QUALIFIED'].includes(row.qualification)) {
      person.known++;
      if (row.qualification === 'QUALIFIED') person.qualified++;
    }
  }
  const avg = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
  return [...people.values()].map(p=>({...p,avg:avg(p.marks),accuracy:avg(p.accuracy),qualRate:p.known ? 100*p.qualified/p.known : null})).sort((a,b)=>(b.avg ?? -Infinity)-(a.avg ?? -Infinity));
}

function Card({title,children}) {
  return <section className="card" style={{padding:20,minWidth:0}}><h3 style={titleStyle}>{title}</h3>{children}</section>;
}

function Ranking({board,onSelect}) {
  const [bottom,setBottom] = useState(false);
  const values = bottom ? board.slice(-5).reverse() : board.slice(0,5);
  return <Card title={bottom?'BOTTOM 5 TRAINEE FACULTY — AVG SCORE':'TOP 5 TRAINEE FACULTY — AVG SCORE'}>
    <button className="btn btn-ghost" onClick={()=>setBottom(!bottom)} style={{marginBottom:12}}>Show {bottom?'top':'bottom'} 5</button>
    {values.map(p=><button key={p.id} onClick={()=>onSelect(p.id)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,width:'100%',padding:'12px 10px',marginBottom:8,border:'1px solid #dbeafe',borderRadius:12,background:bottom?'#fff7ed':'#eff6ff',color:'#1e3a8a',textAlign:'left',cursor:'pointer'}}>
      <span><strong style={{marginRight:10}}>#{1+board.filter(x=>x.avg>p.avg).length}</strong>{p.name}</span><strong style={{color:bottom?orange:blue,fontSize:20}}>{fmt(p.avg)}</strong>
    </button>)}
    {!values.length && <p>No appeared results for these filters.</p>}
  </Card>;
}

function ComparisonPie({board,metric,cutoff,onSelect,title}) {
  const values = board.filter(p=>p[metric]!=null);
  return <Card title={title}>
    {values.length ? <ResponsiveContainer width="100%" height={260}><PieChart>
      <Pie data={values} dataKey="equalSlice" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2} onClick={p=>onSelect(p.id)} style={{cursor:'pointer'}}>
        {values.map(p=><Cell key={p.id} fill={p[metric]>=cutoff?blue:orange}/>)}
      </Pie>
      <Tooltip formatter={(_,__,item)=>[fmt(item.payload[metric]),item.payload.name]}/>
    </PieChart></ResponsiveContainer>:<p>No recorded values for this comparison.</p>}
    <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',fontSize:12,color:'#475569'}}>
      <span style={{color:blue}}>● At / above average</span>
      <span style={{color:orange}}>● Below average</span>
    </div>
    <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Each segment represents one trainee faculty member. Select a segment to view their progress.</p>
  </Card>;
}


function QualificationPie({rows,onSelect}) {
  const [chartWidth,setChartWidth] = useState(500);
  const values = rows.filter(r=>r.status==='APPEARED' && ['QUALIFIED','NOT QUALIFIED'].includes(r.qualification))
    .map(r=>({...r,equalSlice:1}))
    .sort((a,b)=>(a.qualification==='QUALIFIED'?0:1)-(b.qualification==='QUALIFIED'?0:1)
      || String(a.name).localeCompare(String(b.name)) || String(a.email).localeCompare(String(b.email)));
  const qualified = values.filter(r=>r.qualification==='QUALIFIED').length;
  const height = Math.max(360,Math.ceil(values.length/2)*58+48);
  const radius = Math.max(48,Math.min(95,chartWidth*0.2));
  const positions = values.map((_,index)=>{
    const angle = (90-360*(index+0.5)/values.length)*Math.PI/180;
    return {index,side:Math.cos(angle)>=0?1:-1,y:-Math.sin(angle)};
  });
  const label = ({cx,cy,midAngle,outerRadius,index}) => {
    const position = positions[index];
    if (!position) return null;
    const side = position.side;
    const sidePositions = positions.filter(p=>p.side===side).sort((a,b)=>a.y-b.y);
    const rank = sidePositions.findIndex(p=>p.index===index);
    const y = 28+(height-56)*(rank+0.5)/sidePositions.length;
    const x = cx+side*(outerRadius+16);
    const angle = midAngle*Math.PI/180;
    const edgeX = cx+outerRadius*Math.cos(angle);
    const edgeY = cy-outerRadius*Math.sin(angle);
    const available = Math.max(40,chartWidth/2-outerRadius-24);
    const maxChars = Math.max(6,Math.floor(available/6.5));
    const words = String(values[index].name || values[index].email).split(/\s+/);
    const lines = [];
    let line = '';
    for (let word of words) {
      if (line && (line+' '+word).length>maxChars) {lines.push(line);line='';}
      while (word.length>maxChars) {lines.push(word.slice(0,maxChars));word=word.slice(maxChars);}
      if (word) line = line ? line+' '+word : word;
    }
    if (line) lines.push(line);
    const color = values[index].qualification==='QUALIFIED' ? '#1d4ed8' : '#c2410c';
    return <g onClick={()=>onSelect(values[index].email)} style={{cursor:'pointer'}}>
      <polyline points={`${edgeX},${edgeY} ${cx+side*(outerRadius+8)},${y} ${x},${y}`} fill="none" stroke={color} strokeWidth={1}/>
      <text x={x+side*3} y={y-(lines.length-1)*7} textAnchor={side>0?'start':'end'} dominantBaseline="middle" fill={color} fontSize={11} fontWeight={600}>
        {lines.map((text,i)=><tspan key={i} x={x+side*3} dy={i===0?0:14}>{text}</tspan>)}
      </text>
    </g>;
  };
  return <Card title="TRAINEE FACULTY — QUALIFICATION">
    {values.length ? <ResponsiveContainer width="100%" height={height} onResize={width=>setChartWidth(width)}><PieChart>
      <Pie data={values} dataKey="equalSlice" nameKey="name" innerRadius={radius*0.58} outerRadius={radius} startAngle={90} endAngle={-270} paddingAngle={2} label={label} labelLine={false} isAnimationActive={false} onClick={r=>onSelect(r.email)} style={{cursor:'pointer'}}>
        {values.map((r,i)=><Cell key={r._id || i} fill={r.qualification==='QUALIFIED'?blue:orange}/>)}
      </Pie>
      <Tooltip formatter={(_,__,item)=>[item.payload.qualification==='QUALIFIED'?'Qualified':'Not Qualified',item.payload.name]}/>
    </PieChart></ResponsiveContainer>:<p>No qualification outcomes recorded for this test.</p>}
    <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',fontSize:13,fontWeight:600}}>
      <span style={{color:blue}}>● Qualified ({qualified})</span>
      <span style={{color:orange}}>● Not Qualified ({values.length-qualified})</span>
    </div>
    <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Each segment shows a recorded trainee faculty test result. Missing outcomes and absences are excluded. Select a segment to view trainee faculty details.</p>
  </Card>;
}

export default function FacultyManagementCharts({rows,canRank,onSelect}) {
  const board = facultyBoard(rows);
  const ranked = board.filter(p=>p.avg!=null);
  const appeared = rows.filter(r=>r.status==='APPEARED' && numeric(r.marks));
  const average = appeared.length ? appeared.reduce((sum,r)=>sum+r.marks,0)/appeared.length : null;
  const outcomes = appeared.filter(r=>['QUALIFIED','NOT QUALIFIED'].includes(r.qualification));
  const qual = outcomes.length ? 100*outcomes.filter(r=>r.qualification==='QUALIFIED').length/outcomes.length : null;
  const cards = [[Users,board.length,'TOTAL TRAINEE FACULTY'],[BarChart3,appeared.length,'APPEARED RESULTS'],[Award,qual==null?'—':fmt(qual)+'%','TRAINEE FACULTY QUALIFICATION'],[Target,canRank?fmt(average):'—','AVERAGE SCORE']];
  return <div style={{display:'grid',gap:20}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,180px),1fr))',gap:14}}>
      {cards.map(([Icon,value,label])=><div className="card" key={label} style={{padding:20,background:'linear-gradient(135deg,#f0f5ff,#ffffff)',border:'1px solid #dbeafe'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><strong style={{fontSize:30,color:'#1a4fa0'}}>{value}</strong><Icon size={28} color={blue}/></div>
        <p style={{fontSize:12,fontWeight:800,color:'#475569',marginTop:10}}>{label}</p>
        <div style={{height:4,background:'#dbeafe',borderRadius:8,marginTop:14}}/>
      </div>)}
    </div>
    {!canRank ? <Card title="TRAINEE FACULTY COMPARISON"><p>Select a year and test to compare all trainee faculty together.</p></Card> : <>
      <div style={grid}>
        <Ranking board={ranked} onSelect={onSelect}/>
        <QualificationPie rows={rows} onSelect={onSelect}/>
      </div>
      <div style={grid}>{[['avg','TRAINEE FACULTY RANKING — AVERAGE SCORE'],['accuracy','TRAINEE FACULTY — ACCURACY %']].map(([metric,title])=><Card key={metric} title={title}>
        <div style={{width:'100%',minWidth:0}}><div style={{width:'100%',minWidth:0}}>
          <ResponsiveContainer width="100%" height={340}><BarChart data={ranked} barCategoryGap="25%" maxBarSize={26} margin={{top:20,right:12,bottom:12,left:0}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="name" interval={0} angle={-65} textAnchor="end" height={125} tickMargin={8} tick={{fontSize:10}} tickFormatter={name=>name.length>18?name.slice(0,16)+'…':name}/>
            <YAxis width={38} domain={metric==='accuracy'?[0,100]:['auto','auto']} tick={{fontSize:11}}/>
            <Tooltip formatter={v=>fmt(v)+(metric==='accuracy'?'%':'')}/>
            <Bar dataKey={metric} name={metric==='avg'?'Average marks':'Accuracy %'} radius={[6,6,0,0]} onClick={p=>onSelect(p.id)} style={{cursor:'pointer'}}>
              {ranked.map(p=><Cell key={p.id} fill={(metric==='accuracy' ? numeric(p.accuracy) && p.accuracy<85 : p.avg<average)?orange:blue}/>)}
            </Bar>
          </BarChart></ResponsiveContainer>
        </div></div>
      </Card>)}</div>
    </>}
  </div>;
}
