import FacultyManagementCharts from './FacultyManagementCharts';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { parseFacultyRows } from '../services/facultyImport';
const API = 'https://csrl-app-backed-1.onrender.com/api/faculty-tests';
async function request(path = '', body) {
  const response = await fetch(API + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('csrl_token') || ''}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Faculty request failed.'); return data;
}
const show = v => v === null || v === undefined ? '—' : Number.isFinite(v) ? Math.round(v * 100) / 100 : v;

const facultyTestOrder = ['CMT01','CAT01','CMT02','RMT01','CAT02','CMT03','RMT02','CAT03','CMT04','FMT01','FMT02','FMT03','FMT04','CMT05','CAT04','CMT06','FMT05','FMT06','FMT07','FMT08','PAT01','PAT02','FAT01','FAT02','FAT03','FAT04'];
const testOrder = value => {
  const index = facultyTestOrder.indexOf(String(value).toUpperCase().replace(/[^A-Z0-9]/g,''));
  return index < 0 ? facultyTestOrder.length : index;
};
const compareFacultyTests = (a,b) => a.year.localeCompare(b.year,undefined,{numeric:true}) || testOrder(a.test)-testOrder(b.test) || (a.date && b.date ? a.date.localeCompare(b.date) : 0) || a.test.localeCompare(b.test,undefined,{numeric:true});

export default function FacultyTestDashboard({ isAdmin = false, uploadOnly = false }) {
  const [rows,setRows] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [year,setYear] = useState('ALL'), [test,setTest] = useState('ALL'), [centre,setCentre] = useState('ALL'), [faculty,setFaculty] = useState('');
  const [importYear,setImportYear] = useState('2026-27'), [preview,setPreview] = useState(null), [busy,setBusy] = useState(false), [notice,setNotice] = useState('');
  const [deleteYear,setDeleteYear] = useState(''), [deleteTest,setDeleteTest] = useState(''), [deleteConfirmation,setDeleteConfirmation] = useState('');
  const deleteRows = rows.filter(r => r.year === deleteYear && r.test === deleteTest);
  const deleteTests = [...new Set(rows.filter(r => r.year === deleteYear).map(r => r.test))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
  const removeTest = async () => {
    if (!isAdmin || !uploadOnly || busy || loading || !deleteRows.length || deleteConfirmation !== 'DELETE') return;
    if (!window.confirm(`Permanently delete ${deleteRows.length} trainee faculty records for ${deleteTest}, academic year ${deleteYear}?`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await request('/delete',{year:deleteYear,test:deleteTest,ids:deleteRows.map(r=>r._id),confirmation:deleteConfirmation});
      setNotice(`${result.deletedCount} trainee faculty records deleted.`);
      setDeleteTest(''); setDeleteConfirmation(''); setPreview(null); setRows([]);
      await load();
    } catch(e) { setError(e.message); } finally { setBusy(false); }
  };
  const load = async () => { setLoading(true); setError(''); try { setRows((await request()).rows || []); } catch(e) { setError(e.message); } finally { setLoading(false); } };
  useEffect(() => { let live = true; request().then(d => { if(live) setRows(d.rows || []); }).catch(e => { if(live) setError(e.message); }).finally(() => { if(live) setLoading(false); }); return () => { live = false; }; }, []);
  useEffect(() => {
    if (uploadOnly || !rows.length) return;
    const latest = [...rows].sort((a,b) => b.year.localeCompare(a.year,undefined,{numeric:true}) || b.test.localeCompare(a.test,undefined,{numeric:true}))[0];
    setYear(latest.year); setTest(latest.test);
  }, [rows, uploadOnly]);
  const options = key => [...new Set(rows.flatMap(r => key === 'centres' ? r.centres : [r[key]]).filter(Boolean))].sort((a,b) => a.localeCompare(b,undefined,{numeric:true}));
  const filtered = useMemo(() => rows.filter(r => (year === 'ALL' || r.year === year) && (test === 'ALL' || r.test === test) && (centre === 'ALL' || r.centres.includes(centre))), [rows,year,test,centre]);
  const people = [...new Map(filtered.map(r => [r.email,r.name])).entries()];
  const chosen = people.some(([email]) => email === faculty) ? faculty : (people[0]?.[0] || '');
  const history = rows.filter(r => r.email === chosen && (year === 'ALL' || r.year === year)).sort(compareFacultyTests).map(r => ({...r,label:year === 'ALL' ? `${r.test} · ${r.year}` : r.test,marks:r.status === 'APPEARED' ? r.marks : null,accuracy:r.status === 'APPEARED' ? r.accuracy : null,percent:r.status === 'APPEARED' && r.maxMarks > 0 && r.marks !== null ? r.marks/r.maxMarks*100 : null}));
  const facultyCentres = [...new Set(history.flatMap(r => r.centres || []).filter(Boolean))].sort().join(', ');
  const canRank = test !== 'ALL' && year !== 'ALL';
  const upload = async event => { const file = event.target.files?.[0]; event.target.value = ''; if(!file) return; setError('');setPreview(null);setBusy(true);try { const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});setPreview(parseFacultyRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:null}),importYear)); } catch(e){setError(e.message);}finally{setBusy(false);} };
  const confirm = async () => {setBusy(true);setError('');try{const result=await request('/import',{rows:preview.rows});setNotice(`${result.count} results saved. Existing matching results were updated.`);setPreview(null);await load();}catch(e){setError(e.message);}finally{setBusy(false);}};
  const template = () => {
    const profileHeaders = ['FACULTY ID','SL. NO.','TRAINEE NAME','PROJECT','SUBJECT','CONTACT DETAIL','EMAIL ID','PM NAME','MENTOR NAME','DEGREE NAME','COLLEGE NAME','YEAR OF PASSING','DATE OF JOINING CSRL'];
    const testNames = ["CMT-01","CAT-01","CMT-02","RMT-01","CAT-02","CMT-03","RMT-02","CAT-03","CMT-04","FMT-01","FMT-02","FMT-03","FMT-04","CMT-05","CAT-04","CMT-06","FMT-05","FMT-06","FMT-07","FMT-08","PAT-01","PAT-02","FAT-01","FAT-02","FAT-03","FAT-04"];
    const metrics = ['ATTEMPT','CORRECT','ACCURACY','TOTAL MARKS','QUALIFICATION','STATUS','TEST DATE','MAX MARKS','TOTAL QUESTIONS'];
    const top = profileHeaders.map(()=>'FACULTY DETAILS'), headers = [...profileHeaders];
    testNames.forEach(test => metrics.forEach(metric => {top.push(test);headers.push(metric);}));
    const wb = XLSX.utils.book_new(), sheet = XLSX.utils.aoa_to_sheet([top,headers]);
    sheet['!cols'] = headers.map(()=>({wch:22}));
    XLSX.utils.book_append_sheet(wb,sheet,'Faculty Results');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([
      ['Instructions'],
      ['One row per faculty; complete any or all test groups in that row.'],
      ['All 26 test groups from the consolidated workbook are included. Add future tests by copying a complete group and changing its top-row test name.'],
      ['Leave unused test groups blank. Do not change the two header rows.'],
      ['Email is currently required to match records safely; missing emails can be entered in upload preview.'],
      ['Dates: YYYY-MM-DD as text. Accuracy: percentage such as 70%; verified against correct / attempted.'],
      ['STATUS: APPEARED, ABSENT, MEDICAL LEAVE, LEAVE or MISSING. Preserve zero and negative marks.'],
      ['Maximum marks and total questions are optional per-test fields.'],
      ['Qualification: QUALIFIED or NOT QUALIFIED. Leave blank when unavailable.'],
      ['Faculty details are saved with each populated test record.']
    ]),'Instructions');
    XLSX.writeFile(wb,'Faculty-All-Tests-Upload-Template.xlsx');
  };
  return <div style={{display:'grid',gap:20}}>
    <section className="card"><h2>{uploadOnly ? 'Import Trainee Faculty Test Data' : 'Faculty Test Analysis'}</h2><p>Faculty results are separate from student tests. Compare all trainee faculty together by year and test.</p>
      {isAdmin && <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}><label>Import academic year <input className="input" value={importYear} onChange={e=>{setImportYear(e.target.value);setPreview(null);}} disabled={busy}/></label><label className="btn btn-primary">Upload Excel<input type="file" accept=".xlsx,.xls,.csv" onChange={upload} disabled={busy || !importYear.trim()} style={{display:'none'}}/></label><button className="btn btn-ghost" onClick={template}>Download template</button></div>}
      {notice && <p role="status">{notice}</p>}{error && <p role="alert" style={{color:'#b91c1c'}}>{error} <button className="btn btn-ghost" onClick={load}>Retry loading</button></p>}
      {preview && <div><h3>Import preview — {preview.rows.length} results</h3><p>Confirming replaces matching year/email/test/subject results. Other tests remain unchanged. Blank future-test groups are skipped.</p>{preview.warnings.map((w,i)=><p key={i} style={{color:'#92400e'}}>{w}</p>)}<div style={{overflowX:'auto',maxHeight:300}}><table className="table"><thead><tr>{['Name','Email (required)','Test','Subject','Attempted','Correct','Marks','Status'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{preview.rows.map((r,i)=><tr key={i}><td>{r.name}</td><td><input aria-label={`Email for ${r.name}`} value={r.email} onChange={e=>{const email=e.target.value;setPreview(p=>({...p,rows:p.rows.map(x=>x.name===r.name?{...x,email}:x)}));}} /></td><td>{r.test}</td><td>{r.subject}</td><td>{show(r.attempted)}</td><td>{show(r.correct)}</td><td>{show(r.marks)}</td><td>{r.status}</td></tr>)}</tbody></table></div><button className="btn btn-primary" disabled={busy || preview.rows.some(r=>!r.email.includes('@'))} onClick={confirm}>{busy?'Saving…':'Confirm import'}</button> <button className="btn btn-ghost" disabled={busy} onClick={()=>setPreview(null)}>Cancel</button></div>}
    </section>
    {isAdmin && uploadOnly && <section className="card">
      <h3>Delete trainee faculty test data</h3>
      <p>Select the academic year and test to remove. This permanently deletes the selected faculty results across all centres. Student data and other tests are unchanged.</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
        <label>Academic year<select className="input select" value={deleteYear} disabled={busy || loading} onChange={e=>{setDeleteYear(e.target.value);setDeleteTest('');setDeleteConfirmation('');}}>
          <option value="">Select year</option>{options('year').map(v=><option key={v} value={v}>{v}</option>)}
        </select></label>
        <label>Test<select className="input select" value={deleteTest} disabled={busy || loading || !deleteYear} onChange={e=>{setDeleteTest(e.target.value);setDeleteConfirmation('');}}>
          <option value="">Select test</option>{deleteTests.map(v=><option key={v} value={v}>{v}</option>)}
        </select></label>
      </div>
      {loading ? <p role="status">Loading saved tests…</p> : !rows.length ? <p>No saved trainee faculty results.</p> : null}
      {deleteRows.length > 0 && <div>
        <p><strong>{deleteRows.length} records</strong> will be deleted for {deleteTest} ({deleteYear}).</p>
        <div style={{maxHeight:220,overflow:'auto'}}><table className="table"><thead><tr><th>Faculty</th><th>Centre</th><th>Subject</th><th>Marks</th></tr></thead><tbody>{deleteRows.map(r=><tr key={r._id}><td>{r.name}</td><td>{r.centres.join(', ')}</td><td>{r.subject}</td><td>{show(r.marks)}</td></tr>)}</tbody></table></div>
        <label>Type DELETE to confirm <input className="input" value={deleteConfirmation} disabled={busy} onChange={e=>setDeleteConfirmation(e.target.value)} /></label>
        <button className="btn" style={{background:'#b91c1c',color:'white',marginLeft:12}} disabled={busy || loading || deleteConfirmation !== 'DELETE'} onClick={removeTest}>{busy?'Please wait…':'Delete selected test data'}</button>
      </div>}
    </section>}
    {!uploadOnly && (loading ? <p role="status">Loading faculty results…</p> : !rows.length ? <section className="card">No faculty test results uploaded yet.{isAdmin?' Upload the consolidated workbook above.':''}</section> : <>
      <section className="card" style={{display:'flex',gap:12,flexWrap:'wrap'}}>{[['Year',year,setYear,options('year')],['Test',test,setTest,options('test')],['Centre/project',centre,setCentre,options('centres')]].map(([label,value,set,opts])=><label key={label}>{label}<select className="input select" value={value} onChange={e=>set(e.target.value)}><option value="ALL">All</option>{opts.map(v=><option key={v}>{v}</option>)}</select></label>)}</section>
      <FacultyManagementCharts rows={filtered} canRank={canRank} onSelect={setFaculty}/>
      <section className="card" style={{padding:24,border:'1px solid #dbeafe',overflow:'hidden'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:20}}>
          <div><h3 style={{color:'#1e3a8a',fontSize:22,marginBottom:6}}>Trainee Faculty Details</h3><p style={{color:'#64748b',fontSize:13}}>Follow performance from CMT01 onwards.</p></div>
          <label style={{minWidth:220,flex:'0 1 340px',fontSize:12,fontWeight:700,color:'#475569'}}>SELECT FACULTY
            <select className="input select" value={chosen} onChange={e=>setFaculty(e.target.value)} style={{marginTop:6}}>{people.map(([email,name])=><option key={email} value={email}>{name}</option>)}</select>
          </label>
        </div>
        {history.length > 0 ? <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,210px),1fr))',gap:12,padding:16,background:'#f8faff',borderRadius:14,border:'1px solid #e2e8f0',marginBottom:20}}>
            {[['Centre',facultyCentres],...[['Faculty ID','facultyId'],['Contact','contact'],['Project manager','projectManager'],['Mentor','mentor'],['Degree','degree'],['College','college'],['Passing year','passingYear'],['Joining date','joiningDate']].map(([label,key])=>[label,history[history.length-1][key]])].map(([label,value])=><div key={label} style={{minWidth:0}}><div style={{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:0.5,marginBottom:5}}>{label}</div><div style={{fontSize:14,fontWeight:600,color:'#1e293b',overflowWrap:'anywhere'}}>{value || '—'}</div></div>)}
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:18}}>
            {[['Tests recorded',history.length],['Best marks',history.some(r=>Number.isFinite(r.marks))?show(Math.max(...history.filter(r=>Number.isFinite(r.marks)).map(r=>r.marks))):'—'],['Latest marks',show(history[history.length-1].marks)]].map(([label,value])=><div key={label} style={{flex:'1 1 150px',padding:'12px 16px',borderRadius:12,background:'#eff6ff'}}><span style={{fontSize:12,color:'#64748b'}}>{label}</span><strong style={{display:'block',fontSize:24,color:'#1d4ed8',marginTop:4}}>{value}</strong></div>)}
          </div>
          <div style={{overflowX:'auto',background:'linear-gradient(180deg,#f8fbff,#ffffff)',borderRadius:14,border:'1px solid #e2e8f0',paddingTop:16}}>
            <div style={{minWidth:Math.max(480,history.length*110)}}>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={history} margin={{top:20,right:28,bottom:16,left:18}}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#dbe4f0"/>
                  <XAxis dataKey="label" interval={0} padding={{left:45,right:45}} tick={{fontSize:12,fill:'#475569'}} angle={history.length>5?-30:0} textAnchor={history.length>5?'end':'middle'} height={65} tickMargin={14} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="marks" tick={{fontSize:12,fill:'#2563eb'}} axisLine={false} tickLine={false} label={{value:'Marks',angle:-90,position:'insideLeft',fill:'#2563eb',fontSize:12}}/>
                  <YAxis yAxisId="pct" orientation="right" domain={[0,100]} tick={{fontSize:12,fill:'#64748b'}} axisLine={false} tickLine={false} tickFormatter={v=>v+'%'}/>
                  <Tooltip contentStyle={{borderRadius:12,border:'1px solid #dbeafe',boxShadow:'0 8px 24px rgba(30,58,138,.12)',fontSize:13}} formatter={(v,name)=>[show(v)+(name.includes('%')?'%':''),name]} labelStyle={{fontWeight:800,color:'#1e3a8a',marginBottom:8}}/>
                  <Legend iconType="circle" wrapperStyle={{fontSize:13,paddingTop:12}}/>
                  <Line yAxisId="marks" dataKey="marks" name="Marks" stroke="#2563eb" strokeWidth={3} dot={{r:5,fill:'#2563eb',stroke:'#fff',strokeWidth:2}} activeDot={{r:8}} connectNulls={false}/>
                  <Line yAxisId="pct" dataKey="accuracy" name="Accuracy %" stroke="#10b981" strokeWidth={3} dot={{r:4,fill:'#10b981',stroke:'#fff',strokeWidth:2}} activeDot={{r:7}} connectNulls={false}/>
                  {history.some(r=>r.percent!==null)&&<Line yAxisId="pct" dataKey="percent" name="Marks %" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 4" dot={{r:4}} connectNulls={false}/>}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p style={{fontSize:12,color:'#64748b',marginTop:12}}>Tests follow the faculty test sequence, starting with CMT01. Marks use the left axis; percentages use the right. Accuracy = correct ÷ attempted. Marks % is shown when maximum marks are available.</p>
        </> : <p style={{padding:24,color:'#64748b'}}>No test history available for this selection.</p>}
      </section>
    </>)}
  </div>;
}
