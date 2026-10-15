import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const API_BASE = import.meta.env.PROD || window.location.hostname !== 'localhost'
  ? 'https://csrl-app-backed-1.onrender.com/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const timestamp = value => value ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '—';
const duration = value => {
  const seconds = Math.floor((value || 0) / 1000);
  return `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s`;
};
const cell = { padding: '14px 12px', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #e2e8f0' };
export default function PortalLoginTracking() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams({ search, from, to, page: String(page) });
        const res = await fetch(`${API_BASE}/portal-login-tracking?${params}`, { headers: { Authorization: `Bearer ${user.token}` }, signal: controller.signal });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Unable to load tracking');
        setData(result);
      } catch (e) { if (e.name !== 'AbortError') { setError(e.message); setData(null); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    const debounce = setTimeout(load, 250);
    const timer = setInterval(load, 30000);
    return () => { clearTimeout(debounce); clearInterval(timer); controller.abort(); };
  }, [search, from, to, page, refresh, user.token]);
  const changeFilter = setter => e => { setter(e.target.value); setPage(1); setData(null); };
  return <section aria-label="Portal Login Tracking" style={{ display: 'grid', gap: 20, paddingBottom: 24 }}>
    <div className="card" style={{ padding: 24, borderTop: '4px solid #2563eb' }}>
      <h2 style={{ margin: '0 0 8px', color: '#173e73' }}>Portal Login Tracking</h2>
      <p style={{ color: '#64748b', margin: 0 }}>Centre user login history · All timestamps in IST · Updates every 30 seconds</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'end', marginTop: 20 }}>
        <label style={{ flex: '1 1 250px' }}>Search user or centre<input className="input" value={search} onChange={changeFilter(setSearch)} placeholder="Email, name or centre" style={{ display: 'block', width: '100%', marginTop: 6 }} /></label>
        <label>From date (IST)<input type="date" className="input" value={from} onChange={changeFilter(setFrom)} style={{ display: 'block', marginTop: 6 }} /></label>
        <label>To date (IST)<input type="date" className="input" value={to} onChange={changeFilter(setTo)} style={{ display: 'block', marginTop: 6 }} /></label>
        <button className="btn btn-primary" disabled={loading} onClick={() => setRefresh(v => v + 1)}>Refresh</button>
      </div>
    </div>
    {error && <div className="card" role="alert" style={{ padding: 20, color: '#b91c1c' }}>{error} <button className="btn" onClick={() => setRefresh(v => v + 1)}>Retry</button></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
      {[['Users logged in', data?.summary.users], ['Login sessions', data?.total], ['Session time', data ? duration(data.summary.sessionMs) : null], ['Active time', data ? duration(data.summary.activeMs) : null]].map(([label, value]) => <div className="card" key={label} style={{ padding: 22 }}><div style={{ color: '#64748b', fontSize: 13 }}>{label}</div><div style={{ fontWeight: 750, fontSize: 25, color: '#173e73', marginTop: 8 }}>{value ?? '—'}</div></div>)}
    </div>
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: '#eff6ff', color: '#173e73' }}><tr>{['User ID / Name', 'Centre', 'Login time (IST)', 'Last seen (IST)', 'Logout / Estimated end (IST)', 'Session time', 'Active time', 'Status'].map(title => <th key={title} scope="col" style={cell}>{title}</th>)}</tr></thead>
          <tbody>{data?.rows.map(row => <tr key={row._id}>
            <td style={cell}><strong>{row.userId}</strong><div style={{ color: '#64748b', marginTop: 4 }}>{row.name}</div></td>
            <td style={cell}>{row.centres.join(', ')}</td><td style={cell}>{timestamp(row.loginAt)}</td><td style={cell}>{timestamp(row.lastSeenAt)}</td>
            <td style={cell}>{timestamp(row.endTime)}{row.endIsEstimated && <small style={{ display: 'block', color: '#64748b' }}>Estimated — last seen</small>}</td>
            <td style={cell}>{duration(row.sessionMs)}</td><td style={cell}>{duration(row.activeMs)}</td>
            <td style={cell}><span style={{ borderRadius: 20, padding: '5px 10px', background: row.status === 'Online' ? '#dcfce7' : '#f1f5f9', color: row.status === 'Online' ? '#166534' : '#475569' }}>{row.status}</span></td>
          </tr>)}{!data?.rows.length && <tr><td colSpan={8} style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>{loading ? 'Loading login history…' : error ? 'Login history is unavailable.' : 'No recorded logins for these filters. History starts with new centre user logins after this feature is enabled.'}</td></tr>}</tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <span>{data?.total ?? 0} sessions {loading && '· Updating…'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><button className="btn" disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {data?.pages || 1}</span><button className="btn" disabled={!data || page >= data.pages || loading} onClick={() => setPage(p => p + 1)}>Next</button></div>
      </div>
    </div>
    <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Session time estimates time connected to the portal, including idle time. Active time counts visible use and pauses after 5 minutes without interaction. Both are sampled and may lag by about 30 seconds. Disconnected gaps are excluded. Closing a browser or losing connection shows an estimated end after 90 seconds; returning with the same login resumes that session. Totals apply to the selected filters.</p>
  </section>;
}
