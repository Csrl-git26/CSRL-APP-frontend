import {useState,useEffect} from 'react';
import * as XLSX from 'xlsx';
import ResultWorkbookGrid from './ResultWorkbookGrid';
import {useAuth} from '../context/AuthContext';
const API='https://csrl-app-backed-1.onrender.com/api/result-workbooks';
export default function ResultWorkbook({stream,branch,testKey,testOptions=[],admin=false}){
 const {user}=useAuth();const [test,setTest]=useState(''),[file,setFile]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[book,setBook]=useState(null),[sheet,setSheet]=useState(''),[original,setOriginal]=useState(null);
 useEffect(()=>{setBook(null);setOriginal(null);setMessage('');setFile(null);setTest('');},[stream,branch,testKey]);
 const selected=admin?test:testKey;
 const url=API+'?'+new URLSearchParams({stream,branch:branch||'',testKey:selected||''});
 async function run(){
  setBusy(true);setMessage('');
  try{
   const form=new FormData();if(admin)form.append('file',file);
   const response=await fetch(url,{method:admin?'POST':'GET',headers:{Authorization:'Bearer '+user.token},...(admin?{body:form}:{})});
   if(!response.ok){const text=await response.text();let detail;try{detail=JSON.parse(text).message;}catch{}throw Error(detail || 'The result Excel service is unavailable (HTTP '+response.status+'). Please retry after the backend deployment finishes.');}
   if(admin){setMessage('Result Excel uploaded for '+selected);return;}
   const blob=await response.blob();const wb=XLSX.read(await blob.arrayBuffer(),{type:'array',cellStyles:true});setBook(wb);setSheet(wb.SheetNames[0]);setOriginal(blob);
  }catch(e){setMessage(e.message||'Unable to load result Excel.');}finally{setBusy(false);}
 }
 function download(){const a=document.createElement('a');const u=URL.createObjectURL(original);a.href=u;a.download=selected+'-result.'+(original.type.includes('spreadsheetml')?'xlsx':'xls');a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 return <div style={admin?{background:'#fff',padding:24,borderRadius:16,marginBottom:24,border:'1px solid #dbeafe'}:{display:'inline-block'}}>
  {admin&&<><h3>Upload Result Excel</h3><p>{stream}{stream==='JEE'?' / '+branch:''} — original workbook for centre users</p><select value={test} onChange={e=>setTest(e.target.value)}><option value="">Select test</option>{testOptions.filter(t=>t!=='ALL_FMT'&&!t.includes(',')).map(t=><option key={t}>{t}</option>)}</select> <input type="file" accept=".xlsx" onChange={e=>setFile(e.target.files[0]||null)}/></>}
  <button type="button" className="btn btn-primary" style={{borderRadius:12,padding:'10px 14px'}} disabled={busy||!selected||selected.includes(',')||selected==='ALL_FMT'||(admin&&!file)} onClick={run}>{busy?'Loading…':admin?'Upload Result Excel':'Result Excel'}</button>
  {message&&<p role="status">{message}</p>}
  {book&&<div role="dialog" aria-modal="true" aria-label="Result Excel" style={{position:'fixed',inset:'8vh 2vw 4vh max(80px, 8vw)',zIndex:10000,background:'#fff',borderRadius:16,padding:20,boxShadow:'0 0 0 100vmax #0006',display:'flex',flexDirection:'column',gap:12}}>
   <div className="result-workbook-header"><strong>Result Excel — {selected}</strong> <button onClick={download}>Download original Excel</button> <button onClick={()=>setBook(null)}>Close</button></div>
   <div className="result-workbook-tabs">{book.SheetNames.map(n=><button key={n} aria-selected={n===sheet} onClick={()=>setSheet(n)} style={{fontWeight:n===sheet?'bold':'normal'}}>{n}</button>)}</div>
   <p style={{margin:0,fontSize:12}}>Filter or sort columns below. Download original Excel for the complete workbook, including charts and Excel features.</p>
   <ResultWorkbookGrid book={book} sheet={sheet} original={original}/>
  </div>}
 </div>;
}
