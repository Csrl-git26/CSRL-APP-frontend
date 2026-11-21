import {useEffect,useMemo,useState} from 'react';
import * as XLSX from 'xlsx';
import './ResultWorkbookGrid.css';
const color=c=>c?.argb?'#'+c.argb.slice(-6):c?.rgb?'#'+c.rgb.slice(-6):undefined;
function styleOf(cell){
 const s=cell?.style||{},f=s.font||{},a=s.alignment||{},fill=s.fill||{};
 const result={fontFamily:f.name||'Calibri, Arial, sans-serif',fontSize:(f.size||11)+'pt',fontWeight:f.bold?700:400,fontStyle:f.italic?'italic':undefined,color:color(f.color),backgroundColor:color(fill.fgColor),textAlign:a.horizontal||undefined,verticalAlign:a.vertical==='middle'?'middle':a.vertical||undefined,whiteSpace:a.wrapText?'pre-wrap':'nowrap',textDecoration:f.underline?'underline':undefined};
 for(const side of ['top','bottom','left','right']){const b=s.border?.[side];if(b?.style)result['border'+side[0].toUpperCase()+side.slice(1)]=(b.style==='thick'?3:b.style==='medium'?2:1)+'px '+(b.style.includes('dash')?'dashed':'solid')+' '+(color(b.color)||'#8996a5');}
 return result;
}
export default function ResultWorkbookGrid({book,sheet,original}){
 const ws=book.Sheets[sheet];
 const range=useMemo(()=>XLSX.utils.decode_range(ws['!ref']||'A1'),[ws]);
 const [valueFilters,setValueFilters]=useState({}),[filterColumn,setFilterColumn]=useState(null),[valueSearch,setValueSearch]=useState(''),[styled,setStyled]=useState(null),[header,setHeader]=useState(1),[filters,setFilters]=useState({}),[sort,setSort]=useState(null),[zoom,setZoom]=useState(100),[limit,setLimit]=useState(100);
 useEffect(()=>{let active=true;setStyled(null);(async()=>{try{const {default:ExcelJS}=await import('exceljs');const wb=new ExcelJS.Workbook();await wb.xlsx.load(await original.arrayBuffer());if(active)setStyled(wb);}catch{}})();return()=>{active=false};},[original]);
 useEffect(()=>{const af=ws['!autofilter']?.ref;let row=af?XLSX.utils.decode_range(af).s.r:range.s.r;
 if(!af){let best=-1;for(let r=range.s.r;r<=Math.min(range.e.r,range.s.r+15);r++){let score=0;for(let c=range.s.c;c<=range.e.c;c++){const v=ws[XLSX.utils.encode_cell({r,c})];if(v?.v!=null)score+=typeof v.v==='string'?2:0.5;}if(score>best){best=score;row=r;}}}
 setHeader(row+1);setFilters({});setValueFilters({});setFilterColumn(null);setValueSearch('');setSort(null);setLimit(100);},[ws,range]);
 const text=(r,c)=>{const cell=ws[XLSX.utils.encode_cell({r,c})];return cell?String(cell.w??XLSX.utils.format_cell(cell)):'';};
 const cols=Array.from({length:range.e.c-range.s.c+1},(_,i)=>range.s.c+i);
 const rows=useMemo(()=>{const out=[];for(let r=range.s.r;r<=range.e.r;r++)if(r<header||Object.entries(filters).every(([c,v])=>String(ws[XLSX.utils.encode_cell({r,c:Number(c)})]?.w??ws[XLSX.utils.encode_cell({r,c:Number(c)})]?.v??'').toLowerCase().includes(v.toLowerCase()))&&Object.entries(valueFilters).every(([c,values])=>values.includes(text(r,Number(c)))))out.push(r);
 if(sort){const start=out.filter(r=>r<header),data=out.filter(r=>r>=header);data.sort((a,b)=>{const av=ws[XLSX.utils.encode_cell({r:a,c:sort.c})]?.v??'',bv=ws[XLSX.utils.encode_cell({r:b,c:sort.c})]?.v??'';return (typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv),undefined,{numeric:true}))*(sort.desc?-1:1);});return [...start,...data];}return out;},[ws,range,filters,valueFilters,sort,header]);
 const excelSheet=styled?.getWorksheet(sheet);
 const merged=useMemo(()=>{const map=new Map();for(const m of ws['!merges']||[]){for(let r=m.s.r;r<=m.e.r;r++)for(let c=m.s.c;c<=m.e.c;c++)map.set(r+':'+c,{start:r===m.s.r&&c===m.s.c,rows:m.e.r-m.s.r+1,cols:m.e.c-m.s.c+1});}return map;},[ws]);
 const filtering=!!sort||Object.values(filters).some(Boolean)||Object.keys(valueFilters).length>0;
 const options=useMemo(()=>{if(filterColumn===null)return [];const values=new Set();for(let r=header;r<=range.e.r;r++)values.add(text(r,filterColumn));return [...values].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));},[ws,header,range,filterColumn]);
 const visibleOptions=options.filter(v=>v.toLowerCase().includes(valueSearch.toLowerCase()));
 function openFilter(c){setFilterColumn(c);setValueSearch('');}
 function toggleValue(value){setValueFilters(previous=>{const selected=new Set(previous[filterColumn]??options);if(selected.has(value))selected.delete(value);else selected.add(value);return {...previous,[filterColumn]:[...selected]};});setLimit(100);}
 function clearColumn(){setValueFilters(previous=>{const next={...previous};delete next[filterColumn];return next;});setLimit(100);}

 return <div className="result-grid">
 <div className="result-grid-tools"><label>Filter by <select aria-label="Choose a column to filter" value={filterColumn??''} onChange={e=>openFilter(e.target.value===''?null:Number(e.target.value))}><option value="">Select column…</option>{cols.map(c=><option key={c} value={c}>{text(header-1,c)||XLSX.utils.encode_col(c)}</option>)}</select></label><span>Filter header row <input aria-label="Filter header row" type="number" min={range.s.r+1} max={range.e.r+1} value={header} onChange={e=>{setHeader(Math.max(range.s.r+1,Math.min(range.e.r+1,Number(e.target.value)||1)));setFilters({});setValueFilters({});setFilterColumn(null);setValueSearch('');setSort(null);}}/></span><button onClick={()=>{setFilters({});setValueFilters({});setFilterColumn(null);setValueSearch('');setSort(null);}}>Clear filters & sorting</button><label>Zoom <select value={zoom} onChange={e=>setZoom(Number(e.target.value))}>{[60,75,90,100,125,150].map(v=><option key={v} value={v}>{v}%</option>)}</select></label><span>{rows.filter(r=>r>=header).length} data rows</span></div>
 {filterColumn!==null&&<section className="result-value-panel" aria-label="Select filter values">
 <div className="result-value-toolbar"><strong>{text(header-1,filterColumn)||XLSX.utils.encode_col(filterColumn)}</strong><input aria-label="Search filter values" placeholder="Search students, centres or values…" value={valueSearch} onChange={e=>setValueSearch(e.target.value)}/><button onClick={clearColumn}>Select all</button><button onClick={()=>{setValueFilters({...valueFilters,[filterColumn]:[]});setLimit(100);}}>Deselect all</button><button onClick={()=>{setValueFilters({...valueFilters,[filterColumn]:visibleOptions});setLimit(100);}}>Select search results</button><button onClick={()=>setFilterColumn(null)}>Done</button></div>
 <div className="result-value-options">{visibleOptions.map(v=><label key={v}><input type="checkbox" checked={valueFilters[filterColumn]===undefined||valueFilters[filterColumn].includes(v)} onChange={()=>toggleValue(v)}/><span>{v||'(Blanks)'}</span></label>)}{!visibleOptions.length&&<span>No matching values</span>}</div>
 <small>Selections apply immediately. Combine filters from different columns to narrow the results.</small></section>}
 {Object.keys(valueFilters).length>0&&<div className="result-value-chips">{Object.entries(valueFilters).map(([c,values])=><button key={c} onClick={()=>openFilter(Number(c))}>{text(header-1,Number(c))||XLSX.utils.encode_col(Number(c))}: {values.length} selected ▾</button>)}</div>}
 <div className="result-grid-scroll"><table style={{fontSize:11*zoom/100+'pt'}}><colgroup><col style={{width:44}}/>{cols.map(c=><col key={c} style={{width:Math.max(65,Math.min(500,(excelSheet?.getColumn(c+1)?.width||ws['!cols']?.[c]?.wch||12)*7))*zoom/100}}/>)}</colgroup>
 <thead><tr><th>#</th>{cols.map(c=><th key={c}>{XLSX.utils.encode_col(c)}</th>)}</tr><tr><th>Filter</th>{cols.map(c=><th key={c}><div className="result-grid-filter"><input aria-label={'Filter '+text(header-1,c)+' column '+XLSX.utils.encode_col(c)} placeholder={text(header-1,c)||'Filter…'} value={filters[c]||''} onChange={e=>{setFilters({...filters,[c]:e.target.value});setLimit(100);}}/><button aria-label={'Select values for '+(text(header-1,c)||XLSX.utils.encode_col(c))} title="Select values" className={valueFilters[c]!==undefined?'result-filter-active':''} onClick={()=>openFilter(c)}>▾</button><button title="Sort column" onClick={()=>setSort({c,desc:sort?.c===c?!sort.desc:false})}>{sort?.c===c?(sort.desc?'↓':'↑'):'↕'}</button></div></th>)}</tr></thead>
 <tbody>{rows.slice(0,limit).map(r=><tr key={r} style={{height:excelSheet?.getRow(r+1)?.height?excelSheet.getRow(r+1).height*zoom/100+'pt':undefined}}><th>{r+1}</th>{cols.map(c=>{const m=merged.get(r+':'+c);if(!filtering&&m&&!m.start)return null;const ec=excelSheet?.getCell(r+1,c+1);return <td key={c} rowSpan={!filtering?m?.rows:undefined} colSpan={!filtering?m?.cols:undefined} style={{...styleOf(ec),fontSize:((ec?.font?.size||11)*zoom/100)+'pt'}} title={ec?.formula?'='+ec.formula:undefined}>{text(r,c)}</td>;})}</tr>)}</tbody></table></div>
 {rows.length>limit&&<button className="result-grid-more" onClick={()=>setLimit(limit+100)}>Show next 100 rows ({Math.min(limit,rows.length)} / {rows.length})</button>}
 </div>;
}
