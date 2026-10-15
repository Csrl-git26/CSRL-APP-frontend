import { collectTrackingUsers, saveTrackingExport } from '../utils/portalTrackingExport';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const API_BASE = import.meta.env.PROD || window.location.hostname !== 'localhost'
  ? 'https://csrl-app-backed-1.onrender.com/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const timestamp = value => value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '—';
const duration = value => {
  const seconds = Math.floor((value || 0) / 1000);
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s`;
};
const todayIST = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const cell = { padding: '16px 14px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' };
function useTracking(token, params, refresh) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const query = params ? new URLSearchParams(params).toString() : null;
  useEffect(() => {
    if (query === null) return;
    const controller = new AbortController();
    let pending = false;
    setState({ data: null, loading: true, error: '' });
    const load = async () => {
      if (pending) return;
      pending = true;
      try {
        const res = await fetch(`${API_BASE}/portal-login-tracking?${query}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to load tracking');
        if (!controller.signal.aborted) setState({ data, loading: false, error: '' });
      } catch (e) {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: e.message });
      } finally { pending = false; }
    };
    const debounce = setTimeout(load, 250);
    const interval = setInterval(load, 30000);
    return () => { clearTimeout(debounce); clearInterval(interval); controller.abort(); };
  }, [token, query, refresh]);
  return state;
}
function Pages({ data, page, setPage, loading }) {
  return <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', padding: 16 }}>
    <button className="btn" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button>
    <span>Page {page} of {data?.pages || 1}</span>
    <button className="btn" disabled={!data || page >= data.pages || loading} onClick={() => setPage(p => p + 1)}>Next</button>
  </div>;
}
export default function PortalLoginTracking() {
  const { user } = useAuth();
  const [from, setFrom] = useState(() => `${todayIST()}T00:00`);
  const [to, setTo] = useState(() => `${todayIST()}T23:59`);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const detailsRef = useRef(null);
  useEffect(() => {
    const dialog = detailsRef.current;
    if (!selected || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    const positionDialog = () => {
      const area = document.querySelector('.dashboard-page-body');
      const bounds = area?.getBoundingClientRect();
      const left = Math.max(0, bounds?.left || 0);
      const top = Math.max(0, bounds?.top || 0);
      const right = Math.min(window.innerWidth, bounds?.right || window.innerWidth);
      const bottom = Math.min(window.innerHeight, bounds?.bottom || window.innerHeight);
      const width = Math.max(0, right - left);
      const height = Math.max(0, bottom - top);
      dialog.style.left = `${left + width / 2}px`;
      dialog.style.top = `${top + height / 2}px`;
      dialog.style.width = `${Math.min(1100, Math.max(0, width - 32))}px`;
      dialog.style.maxHeight = `${Math.max(0, height - 32)}px`;
    };
    positionDialog();
    dialog.showModal();
    window.addEventListener('resize', positionDialog);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', positionDialog);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [selected]);
  const [allHistory, setAllHistory] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const invalid = !from || !to || from > to;
  const { data, loading, error } = useTracking(user.token, invalid ? null : { view: 'users', from, to, page: String(page) }, refresh);
  const details = useTracking(user.token, selected && !invalid ? { userId: selected.userId, from: allHistory ? '' : from, to: allHistory ? '' : to, page: String(detailPage) } : null, refresh);
  const changeFilter = setter => e => { setter(e.target.value); setPage(1); setSelected(null); };
  const openUser = row => { setSelected(row); setDetailPage(1); setAllHistory(false); };
  const currentData = invalid ? null : data;
  const exportExcel = async () => {
    if (invalid || exporting) return;
    setExporting(true); setExportError('');
    try {
      const rows = await collectTrackingUsers(async exportPage => {
        const params = new URLSearchParams({ view: 'users', from, to, page: String(exportPage) });
        const res = await fetch(`${API_BASE}/portal-login-tracking?${params}`, { headers: { Authorization: `Bearer ${user.token}` } });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Unable to export login tracking.');
        return result;
      });
      saveTrackingExport(rows, from, to);
    } catch (e) { setExportError(e.message || 'Export failed. Please retry.'); }
    finally { setExporting(false); }
  };
  return <section aria-label="Portal Login Tracking" style={{ display: 'grid', gap: 20, paddingBottom: 24 }}>
    <div className="card" style={{ padding: 24, borderTop: '4px solid #2563eb' }}>
      <h2 style={{ margin: '0 0 8px', color: '#173e73' }}>Portal Login Tracking</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end', marginTop: 20 }}>
        <label>From date and time (IST)<input type="datetime-local" disabled={exporting} className="input" value={from} onChange={changeFilter(setFrom)} style={{ display: 'block', marginTop: 6 }} /></label>
        <label>To date and time (IST)<input type="datetime-local" disabled={exporting} className="input" value={to} onChange={changeFilter(setTo)} style={{ display: 'block', marginTop: 6 }} /></label>
        <button className="btn btn-primary" disabled={invalid || loading} onClick={() => setRefresh(v => v + 1)}>Refresh</button>
        <button className="btn btn-success" disabled={invalid || exporting} onClick={exportExcel}>{exporting ? 'Exporting…' : 'Export Excel'}</button>
      </div>
      {exportError && <p role="alert" style={{ color: '#b91c1c' }}>{exportError}</p>}
      {invalid && <p role="alert" style={{ color: '#b91c1c' }}>Select a valid start and end time. The end must not be before the start.</p>}
    </div>
    {!invalid && error && <div className="card" role="alert" style={{ padding: 20, color: '#b91c1c' }}>{error} <button className="btn" onClick={() => setRefresh(v => v + 1)}>Retry</button></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      {[['Users logged in', currentData?.summary.users], ['Total logins', currentData?.summary.loginCount], ['Total active time', currentData ? duration(currentData.summary.activeMs) : null]].map(([label, value]) => <div className="card" key={label} style={{ padding: 22 }}><div style={{ color: '#64748b', fontSize: 13 }}>{label}</div><div style={{ fontWeight: 750, fontSize: 25, color: '#173e73', marginTop: 8 }}>{value ?? '—'}</div></div>)}
    </div>
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#eff6ff', color: '#173e73' }}><tr>{['User', 'Login type', 'Centre / Office', 'Number of logins', 'Total active time'].map(title => <th key={title} scope="col" style={cell}>{title}</th>)}</tr></thead>
          <tbody>{currentData?.rows.map(row => <tr key={row.userId} style={{ background: selected?.userId === row.userId ? '#eff6ff' : undefined }}>
            <td style={cell}><button onClick={() => openUser(row)} style={{ textAlign: 'left', border: 0, background: 'none', color: '#1d4ed8', padding: 0, cursor: 'pointer', font: 'inherit' }} aria-label={`View login details for ${row.name}`}><strong style={{ textDecoration: 'underline' }}>{row.name}</strong><div style={{ marginTop: 4 }}>{row.userId}</div></button></td>
            <td style={cell}>{row.roles.map(role => role === 'admin' ? 'CSRL Management' : 'Centre').join(', ')}</td>
            <td style={cell}>{(row.centres || []).join(', ')}</td><td style={cell}>{row.loginCount}</td><td style={{ ...cell, color: '#173e73', fontWeight: 700 }}>{duration(row.activeMs)}</td>
          </tr>)}{!currentData?.rows.length && <tr><td colSpan={5} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>{invalid ? 'Select a valid period.' : loading ? 'Loading users…' : error ? 'Login history is unavailable.' : 'No recorded logins in this period.'}</td></tr>}</tbody>
        </table>
      </div>
      <Pages data={currentData} page={page} setPage={setPage} loading={loading || invalid} />
    </div>
    {selected && !invalid && createPortal(<>
      <style>{'.portal-login-details-dialog::backdrop { background: rgba(15, 23, 42, .25); }'}</style>
      <dialog ref={detailsRef} className="portal-login-details-dialog" aria-labelledby="portal-login-details-title"
        onCancel={e => { e.preventDefault(); setSelected(null); }}
        onClick={e => {
          if (e.target !== e.currentTarget) return;
          const rect = e.currentTarget.getBoundingClientRect();
          if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) setSelected(null);
        }}
        style={{ position: 'fixed', margin: 0, right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', padding: 24, border: 0, borderTop: '4px solid #2563eb', borderRadius: 16, width: 'min(1100px, calc(100vw - 32px))', maxHeight: '85dvh', overflowY: 'auto', boxSizing: 'border-box', background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', color: '#0f172a', boxShadow: '0 24px 80px rgba(0,0,0,.3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'start' }}>
        <div><h3 id="portal-login-details-title" style={{ margin: '0 0 6px', color: '#173e73' }}>{selected.name} — Login Details</h3><div style={{ color: '#64748b' }}>{selected.userId} · {(selected.centres || []).join(', ')}</div></div>
        <button className="btn" onClick={() => setSelected(null)}>Close details</button>
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', margin: '20px 0' }}>
        <label><input type="checkbox" checked={allHistory} onChange={e => { setAllHistory(e.target.checked); setDetailPage(1); }} /> Show all login history</label>
        <span style={{ color: '#64748b' }}>{allHistory ? 'All recorded logins' : 'Logins in the selected period'} · {details.data?.total ?? '—'} logins · Active time: {details.data ? duration(details.data.summary.activeMs) : '—'}</span>
      </div>
      {details.error && <p role="alert" style={{ color: '#b91c1c' }}>{details.error}</p>}
      <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead style={{ background: '#eff6ff', color: '#173e73' }}><tr>{['Login time (IST)', 'Logout time (IST)', 'Login type', 'Active time', 'Status'].map(title => <th key={title} scope="col" style={cell}>{title}</th>)}</tr></thead>
        <tbody>{details.data?.rows.map(row => <tr key={row._id}>
          <td style={cell}>{timestamp(row.loginAt)}</td><td style={cell}>{timestamp(row.endedAt)}</td>
          <td style={cell}>{row.role === 'admin' ? 'CSRL Management' : 'Centre'}</td><td style={cell}>{duration(row.activeMs)}</td><td style={cell}>{row.status}</td>
        </tr>)}{!details.data?.rows.length && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>{details.loading ? 'Loading login details…' : details.error ? 'Unable to load details.' : 'No logins in this period.'}</td></tr>}</tbody>
      </table></div>
      <Pages data={details.data} page={detailPage} setPage={setDetailPage} loading={details.loading} />
    </dialog></>, document.body)}
  </section>;
}
