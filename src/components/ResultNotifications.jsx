import { useEffect, useRef, useState } from 'react';
import { Mail, Download, Eye, Send, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const API = 'https://csrl-app-backed-1.onrender.com/api/result-notifications';
const field = { display: 'grid', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155' };
const control = { padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', color: '#0f172a', minWidth: 0, width: '100%' };
const button = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#1e40af', fontWeight: 600, cursor: 'pointer' };
const dateLabel = value => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
export default function ResultNotifications({ stream, branch, testOptions = [] }) {
  const { user } = useAuth();
  const [testKey,setTestKey] = useState('');
  const [testDate,setTestDate] = useState('');
  const [audience,setAudience] = useState('centre');
  const [users,setUsers] = useState([]);
  const [selectedEmails,setSelectedEmails] = useState([]);
  const [usersLoading,setUsersLoading] = useState(false);
  const [usersError,setUsersError] = useState('');
  const [history,setHistory] = useState([]);
  const [preview,setPreview] = useState(null);
  const [gmail,setGmail] = useState(null);
  const [sender,setSender] = useState('');
  const [connecting,setConnecting] = useState(false);
  const [configured,setConfigured] = useState(false);
  const [reviewed,setReviewed] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [loadError,setLoadError] = useState('');
  const [notice,setNotice] = useState('');
  const generation = useRef(0);
  const tests = testOptions.filter(t => t && t !== 'ALL_FMT' && !String(t).includes(','));
  async function request(path = '', method = 'GET', body, signal) {
    const response = await fetch(API+path, { method, signal, headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Unable to load notifications. Please retry.');
    return result;
  }
  useEffect(() => { generation.current++; setPreview(null); setReviewed(false); setError(''); setNotice(''); setBusy(false); }, [stream,branch,testKey,testDate,audience,selectedEmails]);
  useEffect(() => {
    const controller = new AbortController();
    setUsers([]); setSelectedEmails([]); setUsersLoading(true); setUsersError('');
    request('/recipients?audience='+audience, 'GET', undefined, controller.signal)
      .then(data => { if (!controller.signal.aborted) setUsers(data.recipients); })
      .catch(e => { if (!controller.signal.aborted) setUsersError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setUsersLoading(false); });
    return () => controller.abort();
  }, [audience,user.token]);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const load = async () => {
      if (pending) return;
      pending = true;
      try {
        const result = await fetch(API, { signal: controller.signal, headers: { Authorization: `Bearer ${user.token}` } });
        const data = await result.json();
        if (!result.ok) throw new Error(data.message || 'Unable to load notifications.');
        if (!controller.signal.aborted) { setHistory(data.campaigns); setSender(data.sender); setConfigured(data.configured); setLoadError(''); }
      } catch(e) { if (!controller.signal.aborted) setLoadError(e.message); }
      finally { pending = false; }
    };
    const loadGmail=async()=>{try{const r=await fetch(API.replace('result-notifications','gmail/status'),{signal:controller.signal,headers:{Authorization:`Bearer ${user.token}`}});if(r.ok&&!controller.signal.aborted)setGmail(await r.json());}catch{}};
    loadGmail(); const gmailTimer=setInterval(loadGmail,5000);
    load(); const timer = setInterval(load,5000);
    return () => { controller.abort(); clearInterval(timer); clearInterval(gmailTimer); };
  }, [user.token]);
  const active = preview ? { ...preview, ...history.find(c => c.id === preview.id), html: preview.html } : null;
  async function action(fn) {
    if (busy) return;
    const version = generation.current;
    setBusy(true); setError(''); setNotice('');
    try { const result = await fn(); if (version === generation.current) { setPreview(previous => ({ ...previous, ...result.campaign })); if (result.configured !== undefined) setConfigured(result.configured); setHistory(rows => [result.campaign,...rows.filter(row => row.id !== result.campaign.id)].slice(0,20)); } }
    catch(e) { if (version === generation.current) setError(e.message); }
    finally { if (version === generation.current) setBusy(false); }
  }
  const makePreview = event => {
    event.preventDefault(); setReviewed(false);
    action(() => request('/preview','POST',{ testKey, stream, branch, testDate, audience, selectedEmails }));
  };
  const send = () => {
    if (!active || !reviewed || !window.confirm(`Send ${active.selection.testKey} results to ${active.recipients.length} recipients from ${sender}?`)) return;
    action(async () => { const result = await request(`/${active.id}/send`,'POST',{ confirm: 'SEND' }); setNotice('Notification queued. You can leave this page; progress is saved.'); return result; });
  };
  const retry = () => {
    if (!active || !window.confirm('Retry only failed recipients? Emails already accepted will not be resent.')) return;
    action(() => request(`/${active.id}/retry`,'POST',{ confirm: 'RETRY' }));
  };
  const download = async () => {
    setError('');
    try {
      const response = await fetch(`${API}/${active.id}/attachment`, { headers: { Authorization: `Bearer ${user.token}` } });
      if (!response.ok) throw new Error('Unable to download the Excel report.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = active.filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
    } catch(e) { setError(e.message); }
  };
  return <section aria-label="Result email notifications" style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 4px 18px rgba(15,23,42,.06)' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
      <span style={{ padding: 12, background: '#eff6ff', borderRadius: 12, color: '#1d4ed8' }}><Mail size={26}/></span>
      <div><h3 style={{ margin: 0, fontSize: 20 }}>Send Result Notification — प्रगति</h3><p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>From: {sender || 'Loading…'} · {stream}{stream === 'JEE' ? ` / ${branch}` : ''}</p></div>
    </div>
    <div style={{marginBottom:16,padding:12,background:'#eff6ff',borderRadius:8}}>
      <strong>{gmail?.connected ? 'Gmail connected: '+gmail.sender : 'Connect Gmail for result notifications'}</strong>
      <button type="button" disabled={connecting||!gmail?.ready} style={{...button,marginLeft:12}} onClick={async()=>{setConnecting(true);setError('');try{const r=await fetch(API.replace('result-notifications','gmail/connect'),{method:'POST',headers:{Authorization:`Bearer ${user.token}`}});const data=await r.json();if(!r.ok)throw Error(data.message);window.location.assign(data.url);}catch(e){setError(e.message);}finally{setConnecting(false);}}}>{connecting?'Connecting…':gmail?.connected?'Reconnect Gmail':'Connect Gmail'}</button>
      {gmail&&!gmail.ready&&<p>Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GMAIL_SENDER_EMAIL in Render.</p>}
      {gmail?.ready&&!gmail.connected&&<p>Add this Authorized redirect URI to your Google OAuth client: <code style={{overflowWrap:'anywhere'}}>{gmail.redirectUri}</code></p>}
      {gmail?.connected&&!gmail.enabled&&<p>Set RESULT_EMAIL_ENABLED=true in Render to enable sending.</p>}
    </div>
    <form onSubmit={makePreview}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
        <label style={field}>Test<select required disabled={busy} value={tests.includes(testKey) ? testKey : ''} onChange={e => setTestKey(e.target.value)} style={control}><option value="">Select a saved test</option>{tests.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
        <label style={field}>Test date<input required type="date" disabled={busy} value={testDate} onChange={e => setTestDate(e.target.value)} style={control}/></label>
        <label style={field}>Recipients<select disabled={busy} value={audience} onChange={e => setAudience(e.target.value)} style={control}><option value="centre">Centre users</option><option value="admin">CSRL Management users</option></select></label>
      </div>
      <div style={{ marginTop: 14, border: '1px solid #cbd5e1', borderRadius: 8, padding: 12 }}>
        <strong>Select users ({selectedEmails.length} selected)</strong>
        {usersLoading && <p>Loading users…</p>}
        {usersError && <p role="alert">{usersError}</p>}
        {!usersLoading && !usersError && !users.length && <p>No users with valid email addresses in this group.</p>}
        <div style={{ maxHeight: 220, overflow: 'auto', marginTop: 8 }}>
          {users.map(r => <label key={r.email} style={{ display: 'flex', gap: 10, padding: 8, alignItems: 'center' }}>
            <input type="checkbox" disabled={busy} checked={selectedEmails.includes(r.email)} onChange={e => setSelectedEmails(list => e.target.checked ? [...list,r.email] : list.filter(email => email !== r.email))}/>
            <span>{r.name} — {r.email}</span>
          </label>)}
        </div>
      </div>
      <button type="submit" disabled={busy || usersLoading || !selectedEmails.length || !tests.includes(testKey) || !testDate} style={{ ...button, marginTop: 16, opacity: busy ? .6 : 1 }}><Eye size={16}/>{busy ? 'Please wait…' : 'Preview email & report'}</button>
    </form>
    {!configured && <p role="status" style={{ background: '#fffbeb', color: '#92400e', borderRadius: 8, padding: 12, fontSize: 13 }}>Email sending is not enabled. Connect Gmail above and set RESULT_EMAIL_ENABLED=true in Render. You can still preview emails and download reports.</p>}
    {(error || loadError) && <p role="alert" style={{ color: '#b91c1c' }}>{error || loadError}</p>}
    {notice && <p role="status" style={{ color: '#166534' }}>{notice}</p>}
    {active && <div style={{ marginTop: 22, borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}><div><strong>{active.subject}</strong><p style={{ margin: '6px 0', fontSize: 13 }}>{active.recipients.length} recipients · {active.state} · Test date: {active.selection.testDate}</p></div><button type="button" style={button} onClick={download}><Download size={16}/>Download Excel report</button></div>
      {!!active.warnings?.length && <div role="alert" style={{ background: '#fff7ed', padding: 12, borderRadius: 8, color: '#9a3412' }}><strong>Resolve these report issues before sending:</strong><ul>{active.warnings.map(w => <li key={w}>{w}</li>)}</ul></div>}
      <iframe title="Result email preview" sandbox="" srcDoc={active.html} style={{ width: '100%', height: 480, border: '1px solid #e2e8f0', borderRadius: 10, marginTop: 12, background: '#fff' }}/>
      <details style={{ margin: '14px 0' }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>View recipients and sending status ({active.recipients.length})</summary><div style={{ maxHeight: 260, overflow: 'auto', marginTop: 8 }}><table style={{ width: '100%', textAlign: 'left', fontSize: 13 }}><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Details</th></tr></thead><tbody>{active.recipients.map(r => <tr key={r.email}><td style={{ padding: 6 }}>{r.name}</td><td>{r.email}</td><td>{r.status}</td><td>{r.error || '—'}</td></tr>)}</tbody></table></div></details>
      {!!active.skippedUsers?.length && <p style={{ fontSize: 13, color: '#92400e' }}>Excluded user IDs without an email address: {active.skippedUsers.join(', ')}</p>}
      <p style={{ fontSize: 13, color: '#475569' }}>Accepted: {active.counts.sent} · Pending: {active.counts.pending + active.counts.sending} · Failed: {active.counts.failed} · Needs review: {active.counts.review} · Skipped: {active.counts.skipped}</p>
      {active.state === 'draft' && <><label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 14 }}><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)}/>I have reviewed the test, report and recipients.</label><button type="button" onClick={send} disabled={!configured || !reviewed || busy || !!active.warnings?.length || !active.recipients.length} style={{ ...button, background: '#1d4ed8', color: '#fff', opacity: !configured || !reviewed || busy || !!active.warnings?.length ? .5 : 1 }}><Send size={16}/>Send notification</button></>}
      {!!active.counts.failed && <button type="button" disabled={!configured || busy} onClick={retry} style={button}><RefreshCw size={16}/>Retry failed emails</button>}
      <p style={{ fontSize: 12, color: '#64748b' }}>Each user receives a separate email. Accepted means the email provider accepted the message; inbox delivery is not confirmed here.</p>
    </div>}
    {!!history.length && <details style={{ marginTop: 20 }}><summary style={{ cursor: 'pointer', fontWeight: 600 }}>Recent notifications</summary><div style={{ maxHeight: 260, overflow: 'auto' }}>{history.map(c => <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}><span style={{ fontSize: 13 }}><strong>{c.selection.testKey}</strong> · {c.selection.stream} · {c.state}<br/>{dateLabel(c.createdAt)} IST · {c.counts.sent} accepted / {c.recipients.length}</span><button type="button" style={button} disabled={busy} onClick={() => { setReviewed(false); action(() => request('/'+c.id)); }}>View</button></div>)}</div></details>}
  </section>;
}
