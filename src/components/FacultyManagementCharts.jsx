import { useState } from 'react';
import { Users, Target, Award, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

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
  return <Card title={bottom?'BOTTOM 5 FACULTY — AVG SCORE':'TOP 5 FACULTY — AVG SCORE'}>
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
      <Tooltip formatter={(_,__,item)=>[fmt(item.payload[metric])+(metric==='qualRate'?'%':''),item.payload.name]}/>
    </PieChart></ResponsiveContainer>:<p>No recorded values for this comparison.</p>}
    <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',fontSize:12,color:'#475569'}}>
      <span style={{color:blue}}>● {metric==='avg'?'At / above average':'≥ 80% qualified'}</span>
      <span style={{color:orange}}>● {metric==='avg'?'Below average':'< 80% qualified'}</span>
    </div>
    <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Each segment represents one faculty member. Select a segment to view their progress.</p>
  </Card>;
}

function Qualification({board,onSelect}) {
  const [bottom,setBottom] = useState(false);
  const sorted = board.filter(p=>p.qualRate!=null).sort((a,b)=>b.qualRate-a.qualRate);
  const values = (bottom ? sorted.slice(-5).reverse() : sorted.slice(0,5)).map((p,i)=>({...p,fill:[blue,'#0891b2','#7c3aed','#16a34a',orange][i]}));
  return <Card title={bottom?'BOTTOM 5 FACULTY — QUALIFICATION':'TOP 5 FACULTY — QUALIFICATION'}>
    <button className="btn btn-ghost" onClick={()=>setBottom(!bottom)}>Show {bottom?'top':'bottom'} 5</button>
    {values.length ? <><ResponsiveContainer width="100%" height={220}><RadialBarChart data={values} innerRadius="25%" outerRadius="95%" startAngle={90} endAngle={-270}>
      <PolarAngleAxis type="number" domain={[0,100]} tick={false}/>
      <RadialBar dataKey="qualRate" background cornerRadius={8} onClick={p=>onSelect(p.id)} style={{cursor:'pointer'}}/>
      <Tooltip formatter={(v,_,item)=>[fmt(v)+'%',item.payload.name]}/>
    </RadialBarChart></ResponsiveContainer>
    {values.map(p=><button key={p.id} className="btn btn-ghost" onClick={()=>onSelect(p.id)} style={{display:'flex',justifyContent:'space-between',width:'100%',color:p.fill,textAlign:'left'}}><span>{p.name}</span><strong>{fmt(p.qualRate)}%</strong></button>)}</>:<p>No qualification outcomes recorded.</p>}
    <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Qualified ÷ results with a recorded qualification outcome. Missing outcomes are excluded.</p>
  </Card>;
}

export default function FacultyManagementCharts({rows,canRank,onSelect}) {
  const board = facultyBoard(rows);
  const ranked = board.filter(p=>p.avg!=null);
  const appeared = rows.filter(r=>r.status==='APPEARED' && numeric(r.marks));
  const average = appeared.length ? appeared.reduce((sum,r)=>sum+r.marks,0)/appeared.length : null;
  const outcomes = appeared.filter(r=>['QUALIFIED','NOT QUALIFIED'].includes(r.qualification));
  const qual = outcomes.length ? 100*outcomes.filter(r=>r.qualification==='QUALIFIED').length/outcomes.length : null;
  const cards = [[Users,board.length,'TOTAL FACULTY'],[BarChart3,appeared.length,'APPEARED RESULTS'],[Award,qual==null?'—':fmt(qual)+'%','FACULTY QUALIFICATION'],[Target,canRank?fmt(average):'—','AVERAGE SCORE']];
  return <div style={{display:'grid',gap:20}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,180px),1fr))',gap:14}}>
      {cards.map(([Icon,value,label])=><div className="card" key={label} style={{padding:20,background:'linear-gradient(135deg,#f0f5ff,#ffffff)',border:'1px solid #dbeafe'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><strong style={{fontSize:30,color:'#1a4fa0'}}>{value}</strong><Icon size={28} color={blue}/></div>
        <p style={{fontSize:12,fontWeight:800,color:'#475569',marginTop:10}}>{label}</p>
        <div style={{height:4,background:'#dbeafe',borderRadius:8,marginTop:14}}/>
      </div>)}
    </div>
    {!canRank ? <Card title="FACULTY COMPARISON"><p>Select a year and test to compare all trainee faculty together.</p></Card> : <>
      <div style={grid}>
        <Ranking board={ranked} onSelect={onSelect}/>
        <Qualification board={board} onSelect={onSelect}/>
        <ComparisonPie board={ranked} metric="avg" cutoff={average} onSelect={onSelect} title="FACULTY — TOTAL AVG SCORE"/>
        <ComparisonPie board={board} metric="qualRate" cutoff={80} onSelect={onSelect} title="FACULTY — QUALIFICATION"/>
      </div>
      <div style={grid}>{[['avg','FACULTY RANKING — AVERAGE SCORE'],['accuracy','FACULTY — ACCURACY %']].map(([metric,title])=><Card key={metric} title={title}>
        <div style={{overflowX:'auto'}}><div style={{minWidth:Math.max(400,ranked.length*95)}}>
          <ResponsiveContainer width="100%" height={340}><BarChart data={ranked} margin={{top:20,right:20,bottom:70,left:5}}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
            <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" height={90} tick={{fontSize:11}}/>
            <YAxis domain={metric==='accuracy'?[0,100]:['auto','auto']} tick={{fontSize:11}}/>
            <Tooltip formatter={v=>fmt(v)+(metric==='accuracy'?'%':'')}/>
            <Bar dataKey={metric} name={metric==='avg'?'Average marks':'Accuracy %'} radius={[6,6,0,0]} onClick={p=>onSelect(p.id)} style={{cursor:'pointer'}}>
              {ranked.map(p=><Cell key={p.id} fill={metric==='avg'&&p.avg<average?orange:blue}/>)}
            </Bar>
          </BarChart></ResponsiveContainer>
        </div></div>
      </Card>)}</div>
    </>}
  </div>;
}
