import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import './PragatiChat.css';

const API = import.meta.env.PROD || (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  ? 'https://csrl-app-backed-1.onrender.com/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const welcome = { answer: 'Ask about centre trends, student marks, or students needing attention. Choose the stream and test series. Answers use the records your login can access.' };
export default function PragatiChat() {
  const { user } = useAuth();
  const [open,setOpen] = useState(false), [question,setQuestion] = useState('');
  const [stream,setStream] = useState(user?.stream || 'JEE'), [branch,setBranch] = useState('MAIN');
  const [messages,setMessages] = useState([{ role: 'assistant', ...welcome }]);
  const [context,setContext] = useState(null), [busy,setBusy] = useState(false), [status,setStatus] = useState(null);
  const panel = useRef(null), input = useRef(null), launcher = useRef(null), end = useRef(null), abort = useRef(null), active = useRef(false);
  const headers = () => ({ 'Content-Type':'application/json', Authorization:`Bearer ${user?.token || ''}` });
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(`${API}/chat/status`,{ headers: headers(), signal: controller.signal }).then(r => r.ok ? r.json() : null).then(setStatus).catch(() => {});
    input.current?.focus();
    const onKey = e => {
      if (e.key === 'Escape') { setOpen(false); launcher.current?.focus(); }
      if (e.key !== 'Tab') return;
      const items = [...(panel.current?.querySelectorAll('button:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary, [tabindex="0"]') || [])];
      if (!items.length) return;
      const first = items[0], last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown',onKey);
    return () => { controller.abort(); document.removeEventListener('keydown',onKey); };
  },[open,user?.token]);
  useEffect(() => { if (open) end.current?.scrollIntoView({ block:'nearest' }); },[messages,busy,open]);
  const reset = () => { setMessages([{ role:'assistant',...welcome }]); setContext(null); setQuestion(''); };
  async function send(text = question) {
    const q = text.trim();
    if (!q || active.current || q.length > 800) return;
    active.current = true; setBusy(true); setQuestion('');
    setMessages(m => [...m,{ role:'user',answer:q }]);
    const controller = new AbortController(); abort.current = controller;
    const timeout = setTimeout(() => controller.abort(),60000);
    try {
      const response = await fetch(`${API}/chat`, { method:'POST', headers:headers(), signal:controller.signal, body:JSON.stringify({ question:q,stream,branch,context }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || (response.status === 401 ? 'Please sign in again.' : 'Chat is unavailable. Please try again shortly.'));
      setMessages(m => [...m,{ role:'assistant',...data }]);
      if (data.context) setContext(data.context);
      if (typeof data.aiEnabled === 'boolean') setStatus({ aiEnabled:data.aiEnabled });
    } catch (e) {
      setMessages(m => [...m,{ role:'assistant',answer:e.name === 'AbortError' ? 'The request took too long. Please try again.' : e.message,error:true }]);
    } finally { clearTimeout(timeout); active.current=false; setBusy(false); }
  }
  if (!user || !['ADMIN','CENTRE','STUDENT'].includes(user.role)) return null;
  const suggestions = user.role === 'STUDENT' ? ['Show my student progress in Physics in the last 3 CMT tests'] : ['Which centres improved in the last 2 CMT tests?', 'KNP centre students needing attention in Physics in the last 3 CMT tests'];
  return createPortal(<div className="pragati-chat-root">
    {!open && <button ref={launcher} type="button" className="pc-launch" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Open chatbot" title="Open chatbot"><span className="pc-launch-art" aria-hidden="true"><svg viewBox="0 0 80 80" width="58" height="58" fill="none"><circle cx="39" cy="40" r="36" fill="#050d43"/><path d="M38 26V17" stroke="#dce9f3" strokeWidth="2"/><circle cx="38" cy="16" r="3" fill="white"/><rect x="15" y="34" width="47" height="13" rx="6" fill="#dfedf5"/><path d="M31 55h15v11H31z" fill="#dce9f3"/><path d="M17 77c2-10 10-14 21-14s19 4 22 14" fill="white"/><rect x="18" y="25" width="41" height="32" rx="15" fill="#dfedf5"/><rect x="21" y="25" width="38" height="32" rx="14" fill="white"/><rect x="25" y="33" width="29" height="16" rx="8" fill="#050d43"/><circle cx="33" cy="41" r="2.5" fill="#00dce8"/><circle cx="46" cy="41" r="2.5" fill="#00dce8"/><path d="M56 3h14a10 10 0 0 1 0 20h-7l-7 5v-5a10 10 0 0 1 0-20Z" fill="#00dce8"/><text x="63" y="17" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#050d43">HI!</text></svg></span><span className="pc-launch-label">Chatbot</span></button>}
    {open && <div className="pc-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section ref={panel} className="pc-panel" role="dialog" aria-modal="true" aria-labelledby="pc-title">
        <header className="pc-header"><div><strong id="pc-title">Chatbot</strong><span>{status?.aiEnabled ? 'AI connected · Answers from portal records' : 'Database answers · AI connection pending'}</span></div><button type="button" aria-label="Close chat" onClick={() => { setOpen(false); launcher.current?.focus(); }}>×</button></header>
        <div className="pc-controls">
          <label>Stream<select value={stream} disabled={busy} onChange={e => { setStream(e.target.value);reset(); }}><option>JEE</option><option>NEET</option></select></label>
          {stream === 'JEE' && <label>Branch<select value={branch} disabled={busy} onChange={e => {setBranch(e.target.value);reset();}}><option value="MAIN">Main</option><option value="ADVANCED">Advanced</option></select></label>}
          <button type="button" disabled={busy} onClick={reset}>New chat</button>
        </div>
        <div className="pc-messages" role="log" aria-live="polite" aria-relevant="additions">
          {messages.map((m,i) => <article key={i} className={`pc-message pc-${m.role}${m.error ? ' pc-error' : ''}`}>
            <div className="pc-author">{m.role === 'user' ? 'You' : 'Chatbot'}{m.mode && m.mode !== 'conversation' && <small>{m.mode === 'ai' ? 'AI-assisted' : 'Calculated database answer'}</small>}</div>
            <p>{m.answer}</p>
            {m.context && <div className="pc-filters">Using: {m.context.centers?.join(', ') || 'Permitted centres'} · {m.context.subject} · {m.context.testIds?.join(', ') || `${m.context.series || 'available series'}, last ${m.context.count} tests`}</div>}
            {!!m.rows?.length && <div className="pc-table-scroll" tabIndex={0} role="region" aria-label="Calculated result table"><table><thead><tr>{m.columns.map((c,j) => <th key={j}>{c}</th>)}</tr></thead><tbody>{m.rows.map((r,j) => <tr key={j}>{r.map((cell,k) => <td key={k} data-label={m.columns[k]}>{cell ?? '—'}</td>)}</tr>)}</tbody></table></div>}
            {m.totalRows > m.rows?.length && <p>Showing the first {m.rows.length} of {m.totalRows} matches. Narrow the centre or criteria for a shorter list.</p>}
            {!!m.sources?.length && <div className="pc-sources"><strong>Source tests:</strong> {m.sources.map(s => s.test).join(' → ')}</div>}
            {!!m.notes?.length && <details><summary>Criteria and limitations</summary><ul>{m.notes.map((n,j) => <li key={j}>{n}</li>)}</ul></details>}
            {m.explanation && <div className="pc-explanation"><strong>AI explanation</strong><p>{m.explanation}</p><small>Check the calculated table above for exact figures.</small></div>}
          </article>)}
          {messages.length === 1 && <div className="pc-suggestions">{suggestions.map(q => <button key={q} type="button" disabled={busy} onClick={() => send(q)}>{q}</button>)}</div>}
          {busy && <p className="pc-loading" role="status">Checking permitted records…</p>}
          <div ref={end}/>
        </div>
        <form className="pc-form" onSubmit={e => { e.preventDefault();send(); }}>
          <label htmlFor="pc-question">Your question</label>
          <div><textarea id="pc-question" ref={input} value={question} maxLength={800} rows={2} placeholder="Ask about a centre, subject or student…" onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();send();} }}/><button type="submit" disabled={busy || !question.trim()}>Send</button></div>
          <small>When AI is connected, your question and limited analysis context are processed by Cloudflare. Do not enter passwords or contact details.</small>
        </form>
      </section>
    </div>}
  </div>,document.body);
}
