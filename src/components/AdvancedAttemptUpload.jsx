import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '../context/AuthContext';
const API='https://csrl-app-backed-1.onrender.com/api/advanced-attempts';
const inputStyle={padding:10,border:'1px solid #cbd5e1',borderRadius:8,background:'#fff',color:'#0f172a',width:'100%',minWidth:0};
export default function AdvancedAttemptUpload({testOptions=[]}) {
  const {user}=useAuth(); const [testId,setTestId]=useState(''),[file,setFile]=useState(null),[preview,setPreview]=useState(null),[saved,setSaved]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const rowsRef=useRef(null),generation=useRef(0),fileRef=useRef();
  const tests=testOptions.filter(t=>t && t!=='ALL_FMT' && !String(t).includes(','));
  const api=async(path='',body,signal)=>{
    const response=await fetch(API+path,{method:body?'POST':'GET',signal,headers:{Authorization:`Bearer ${user.token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify({...body,stream:'JEE',branch:'ADVANCED',testId})}:{})});
    const data=await response.json().catch(()=>({})); if(!response.ok)throw new Error(data.message||'Unable to upload Advanced attempt data.');return data;
  };
  useEffect(()=>{
    generation.current++;setPreview(null);rowsRef.current=null;setError('');setNotice('');setSaved(null);
    if(!testId)return;
    const controller=new AbortController();
    api('?'+new URLSearchParams({testId,stream:'JEE',branch:'ADVANCED'}),null,controller.signal).then(data=>{if(!controller.signal.aborted)setSaved(data.saved);}).catch(e=>{if(!controller.signal.aborted)setError(e.message);});
    return()=>controller.abort();
  },[testId,user.token]);
  useEffect(()=>()=>{generation.current++;},[]);
  async function readPreview(event) {
    event.preventDefault();if(!file||!tests.includes(testId)||busy)return;
    const version=generation.current;setBusy(true);setError('');setNotice('');setPreview(null);
    try{
      if(file.size>10*1024*1024)throw new Error('Choose a sheet smaller than 10 MB.');
      const book=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false,cellNF:true});
      const sheet=book.Sheets[book.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,blankrows:false,raw:true});
      const headers=(rows[0]||[]).map(v=>String(v||'').toLowerCase().replace(/[^a-z0-9]/g,''));
      // Excel-native percentage cells store fractions; normalize to the ACC% column's 0–100 unit.
      const acc=headers.indexOf('acc');
      if(acc>=0){const range=XLSX.utils.decode_range(sheet['!ref']||'A1'); for(let r=range.s.r+1;r<=range.e.r;r++){const cell=sheet[XLSX.utils.encode_cell({r,c:range.s.c+acc})];if(cell&&typeof cell.v==='number'&&cell.z?.includes('%'))cell.v*=100;}
        const normalized=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,blankrows:false,raw:true});rows.splice(0,rows.length,...normalized);}
      const result=await api('/preview',{rows});
      if(version===generation.current){rowsRef.current=rows;setPreview(result);}
    }catch(e){if(version===generation.current)setError(e.message);}
    finally{if(version===generation.current)setBusy(false);}
  }
  async function upload() {
    if(!preview||busy)return;
    const message=preview.version?`Replace the existing attempt-count sheet (${preview.previousCount} students) for ${testId} with these ${preview.count} students?`:`Upload attempt counts for ${preview.count} students to JEE Advanced ${testId}?`;
    if(!window.confirm(message+' Marks and ranks will stay unchanged.'))return;
    const version=generation.current;setBusy(true);setError('');
    try{
      const result=await api('',{rows:rowsRef.current,filename:file.name,version:preview.version,confirm:'UPLOAD'});
      if(version===generation.current){setNotice(result.message+' Reopen the Advanced dashboard to refresh its charts.');setPreview(null);setFile(null);rowsRef.current=null;if(fileRef.current)fileRef.current.value='';const info=await api('?'+new URLSearchParams({testId,stream:'JEE',branch:'ADVANCED'}));setSaved(info.saved);}
    }catch(e){if(version===generation.current)setError(e.message);}
    finally{if(version===generation.current)setBusy(false);}
  }
  return <section className="card" aria-label="JEE Advanced attempt and accuracy upload" style={{marginBottom:24,padding:24}}>
    <h3 style={{margin:'0 0 8px'}}>JEE Advanced — Attempt & Accuracy Sheet</h3>
    <p style={{fontSize:13,color:'#475569'}}>Upload student question counts for the selected Advanced test. This sheet supplies total attempt and accuracy; marks and ranks continue to use the result sheet.</p>
    <form onSubmit={readPreview}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
      <label style={{display:'grid',gap:6,fontSize:13,fontWeight:600}}>Advanced test<select required disabled={busy} value={tests.includes(testId)?testId:''} onChange={e=>setTestId(e.target.value)} style={inputStyle}><option value="">Select a saved Advanced test</option>{tests.map(t=><option key={t}>{t}</option>)}</select></label>
      <label style={{display:'grid',gap:6,fontSize:13,fontWeight:600}}>Attempt-count sheet<input ref={fileRef} type="file" required disabled={busy} accept=".xlsx,.xls,.csv" onChange={e=>{generation.current++;setFile(e.target.files?.[0]||null);setPreview(null);rowsRef.current=null;setError('');setNotice('');}} style={inputStyle}/></label>
    </div><p style={{fontSize:12,color:'#64748b',overflowWrap:'anywhere'}}>Columns: name, Roll Number, stream, centre, total_questions, not_attempted, attempted, incorrect, correct, ACC% (optional).</p>
    <button className="btn btn-primary" disabled={busy||!file||!tests.includes(testId)} type="submit">{busy?'Please wait…':'Preview Advanced upload'}</button></form>
    {saved&&<p style={{fontSize:13,color:'#475569'}}>Current upload: {saved.filename} · {saved.count} students · {new Date(saved.uploadedAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</p>}
    {error&&<p role="alert" style={{whiteSpace:'pre-wrap',color:'#b91c1c',background:'#fef2f2',padding:12,borderRadius:8}}>{error}</p>}
    {notice&&<p role="status" style={{color:'#166534'}}>{notice}</p>}
    {preview&&<div style={{marginTop:16,padding:16,border:'1px solid #bfdbfe',borderRadius:10,background:'#eff6ff'}}>
      <strong>{preview.testId}: {preview.count} students · {preview.centres.length} centres · {preview.questionCounts.join(" / ")} questions per student</strong>
      {preview.questionCounts.length>1&&<p role="status" style={{color:'#92400e'}}>The sheet has different total question counts ({preview.questionCounts.join(', ')}). Each student's original counts will be preserved. Check these rows before uploading.</p>}
      <p>Average attempt: {preview.metrics.Total_Attempted.toFixed(1)} · Overall accuracy: {preview.metrics.Total_Accuracy.toFixed(1)}%</p>
      <p style={{fontSize:13}}>Accuracy = correct ÷ attempted × 100. Centre accuracy uses total correct ÷ total attempted. This file has total counts only, so subject-wise attempt and accuracy show as unavailable.</p>
      <div style={{overflowX:'auto',marginBottom:12}}><table style={{width:'100%',fontSize:13,textAlign:'left'}}><thead><tr>{['Roll Number','Name','Centre','Attempted','Correct','Incorrect','Accuracy'].map(h=><th key={h} style={{padding:6}}>{h}</th>)}</tr></thead><tbody>{preview.preview.map(r=><tr key={r.roll}>{[r.roll,r.name,r.centre,r.attempted,r.correct,r.incorrect,(r.attempted?r.correct/r.attempted*100:0).toFixed(1)+'%'].map((v,i)=><td key={i} style={{padding:6}}>{v}</td>)}</tr>)}</tbody></table></div>
      <button className="btn btn-primary" type="button" disabled={busy} onClick={upload}>{preview.version?'Replace Advanced attempt sheet':'Upload Advanced attempt sheet'}</button>
    </div>}
  </section>;
}
