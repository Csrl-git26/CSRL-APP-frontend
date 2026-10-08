import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import { parseFacultyRows } from '../services/facultyImport';
const API = 'https://csrl-app-backed-1.onrender.com/api/faculty-tests';
async function request(path = '', body) {
  const response = await fetch(API + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${localStorage.getItem('csrl_token') || ''}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json(); if (!response.ok) throw new Error(data.message || 'Faculty request failed.'); return data;
}
const show = v => v === null || v === undefined ? '—' : Number.isFinite(v) ? Math.round(v * 100) / 100 : v;
export default function FacultyTestDashboard({ isAdmin = false, uploadOnly = false }) {
  const [rows,setRows] = useState([]), [loading,setLoading] = useState(true), [error,setError] = useState('');
  const [year,setYear] = useState('ALL'), [test,setTest] = useState('ALL'), [subject,setSubject] = useState('ALL'), [centre,setCentre] = useState('ALL'), [faculty,setFaculty] = useState('');
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
  const options = key => [...new Set(rows.flatMap(r => key === 'centres' ? r.centres : [r[key]]).filter(Boolean))].sort((a,b) => a.localeCompare(b,undefined,{numeric:true}));
  const filtered = useMemo(() => rows.filter(r => (year === 'ALL' || r.year === year) && (test === 'ALL' || r.test === test) && (subject === 'ALL' || r.subject === subject) && (centre === 'ALL' || r.centres.includes(centre))), [rows,year,test,subject,centre]);
  const appeared = filtered.filter(r => r.status === 'APPEARED' && r.marks !== null);
  const mean = key => { const v = appeared.map(r => r[key]).filter(x => x !== null && x !== undefined); return v.length ? v.reduce((a,b) => a+b,0)/v.length : null; };
  const people = [...new Map(filtered.map(r => [r.email,r.name])).entries()];
  const chosen = people.some(([email]) => email === faculty) ? faculty : (people[0]?.[0] || '');
  const history = rows.filter(r => r.email === chosen && (year === 'ALL' || r.year === year) && (subject === 'ALL' || r.subject === subject)).sort((a,b) => (a.date && b.date ? a.date.localeCompare(b.date) : a.test.localeCompare(b.test,undefined,{numeric:true}))).map(r => ({...r,label:`${r.test} (${r.subject})`,percent:r.maxMarks && r.marks !== null ? r.marks/r.maxMarks*100 : null}));
  const ranking = [...filtered].sort((a,b) => (b.marks ?? -Infinity) - (a.marks ?? -Infinity));
  const canRank = test !== 'ALL' && subject !== 'ALL' && year !== 'ALL';
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
    <section className="card"><h2>{uploadOnly ? 'Import Trainee Faculty Test Data' : 'Faculty Test Analysis'}</h2><p>Faculty results are separate from student tests. Filter by year, test and subject for comparable rankings.</p>
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
      <section className="card" style={{display:'flex',gap:12,flexWrap:'wrap'}}>{[['Year',year,setYear,options('year')],['Test',test,setTest,options('test')],['Subject',subject,setSubject,options('subject')],['Centre/project',centre,setCentre,options('centres')]].map(([label,value,set,opts])=><label key={label}>{label}<select className="input select" value={value} onChange={e=>set(e.target.value)}><option value="ALL">All</option>{opts.map(v=><option key={v}>{v}</option>)}</select></label>)}</section>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>{[['Appeared results',appeared.length],['Absent / on leave',filtered.filter(r=>['ABSENT','LEAVE','MEDICAL LEAVE'].includes(r.status)).length],['Average marks',canRank?show(mean('marks')):'Select year/test/subject'],['Average accuracy',mean('accuracy') === null?'—':`${show(mean('accuracy'))}%`],['Qualified results',filtered.filter(r=>r.qualification==='QUALIFIED').length]].map(([label,value])=><div className="card" key={label}><strong>{value}</strong><p>{label}</p></div>)}</div>
      <section className="card"><h3>Faculty marks comparison</h3>{canRank?<ResponsiveContainer width="100%" height={320}><BarChart data={appeared}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="marks" fill="#2563eb"/></BarChart></ResponsiveContainer>:<p>Select a year, test and subject to compare marks fairly.</p>}</section>
      <section className="card"><h3>Faculty progress across tests</h3><select className="input select" value={chosen} onChange={e=>setFaculty(e.target.value)}>{people.map(([email,name])=><option key={email} value={email}>{name}</option>)}</select>{history.length > 0 && <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:12}}>{[['Faculty ID','facultyId'],['Contact','contact'],['Project manager','projectManager'],['Mentor','mentor'],['Degree','degree'],['College','college'],['Passing year','passingYear'],['Joining date','joiningDate']].map(([label,key]) => <span key={key}><strong>{label}:</strong> {history[history.length-1][key] || '—'}</span>)}</div>}<p>Accuracy is correct ÷ attempted. Marks percentage appears only when maximum marks are supplied. Without test dates, tests are ordered by name.</p><div style={{overflowX:'auto'}}><div style={{minWidth:Math.max(420,history.length*100)}}><ResponsiveContainer width="100%" height={360}><LineChart data={history} margin={{top:12,right:24,bottom:12,left:24}}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="label" interval={0} tickFormatter={value=>value.replace(/\s*\([^)]*\)$/, '')} padding={{left:40,right:40}} angle={-30} textAnchor="end" height={65} tickMargin={10}/><YAxis yAxisId="marks"/><YAxis yAxisId="pct" orientation="right" domain={[0,100]}/><Tooltip/><Legend/><Line yAxisId="marks" dataKey="marks" name="Marks" stroke="#2563eb" connectNulls={false}/><Line yAxisId="pct" dataKey="accuracy" name="Accuracy %" stroke="#16a34a" connectNulls={false}/><Line yAxisId="pct" dataKey="percent" name="Marks %" stroke="#9333ea" connectNulls={false}/></LineChart></ResponsiveContainer></div></div></section>
      <section className="card" style={{overflowX:'auto'}}><h3>Test results — {filtered.length} records</h3><table className="table"><thead><tr>{['Rank','Faculty','Centre','Test','Subject','Attempted','Correct','Accuracy','Marks','Qualification','Status'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{ranking.map(r=><tr key={r._id}><td>{canRank && r.marks !== null ? 1+ranking.filter(o=>o.marks!==null && o.marks>r.marks).length:'—'}</td><td><button className="btn btn-ghost" onClick={()=>setFaculty(r.email)}>{r.name}</button></td><td>{r.centres.join(', ')}</td><td>{r.test}</td><td>{r.subject}</td><td>{show(r.attempted)}</td><td>{show(r.correct)}</td><td>{r.accuracy===null?'—':`${show(r.accuracy)}%`}</td><td>{show(r.marks)}</td><td>{r.qualification||'—'}</td><td>{r.status}</td></tr>)}</tbody></table>{!filtered.length&&<p>No results match these filters.</p>}</section>
    </>)}
  </div>;
}
