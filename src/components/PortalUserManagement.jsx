import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const API = 'https://csrl-app-backed-1.onrender.com/api/portal-users';
async function request(token, method, role, data, signal) {
  const response = await fetch(`${API}?role=${role}`, {
    method, signal,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(data ? { body: JSON.stringify({ ...data, role }) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'Unable to manage users. Please retry.');
  return result;
}
function LoginUsersCard({ role, title, user }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [centres, setCentres] = useState(role === 'admin' ? 'H.O.' : '');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const load = useCallback(async signal => {
    setLoading(true); setLoadError('');
    try {
      const result = await request(user.token, 'GET', role, null, signal);
      if (!signal?.aborted) { setUsers(result.users || []); setSelected(''); }
    } catch (e) { if (!signal?.aborted) setLoadError(e.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [user.token, role]);
  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);
  const add = async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await request(user.token, 'POST', role, { name: name.trim(), userId: userId.trim(), centres: centres.split(',').map(c => c.trim()).filter(Boolean) });
      setNotice(`${result.user.userId} added to ${title}.`);
      setName(''); setUserId(''); setCentres(role === 'admin' ? 'H.O.' : '');
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const selectedUser = users.find(u => u.userId === selected);
  const isCurrentUser = role === 'admin' && selected === user.loginUserId;
  const remove = async () => {
    if (!selectedUser || busy || loading || loadError || isCurrentUser) return;
    if (!window.confirm(`Delete ${selectedUser.userId} from ${title}? Their login access will stop. Existing activity history will be kept.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await request(user.token, 'DELETE', role, { userId: selectedUser.userId, version: selectedUser.version });
      setNotice(`${selectedUser.userId} removed from ${title}.`);
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const field = { display: 'grid', gap: 5, fontSize: 13, fontWeight: 600, color: '#334155' };
  return <section aria-label={`${title} user management`} style={{ border: '1px solid #dbeafe', borderRadius: 12, padding: 18, minWidth: 0, background: '#fff' }}>
    <h3 style={{ margin: '0 0 14px', color: '#1e3a8a' }}>{title}</h3>
    <form onSubmit={add} style={{ display: 'grid', gap: 12 }}>
      <label style={field}>Full name<input className="input" value={name} onChange={e => setName(e.target.value)} required maxLength={120} disabled={busy} autoComplete="off" /></label>
      <label style={field}>New user ID<input className="input" value={userId} onChange={e => setUserId(e.target.value)} required minLength={2} maxLength={120} pattern="[A-Za-z0-9][A-Za-z0-9._@+\-]{1,119}" disabled={busy} placeholder="e.g. name@csrl.in" autoComplete="off" autoCapitalize="none" spellCheck={false} /></label>
      <label style={field}>{role === 'centre' ? 'Centre / Project' : 'Office'}<input className="input" value={centres} onChange={e => setCentres(e.target.value)} maxLength={1600} disabled={busy} placeholder={role === 'centre' ? 'e.g. AGR, DDN' : 'H.O.'} /></label>
      <small style={{ color: '#64748b' }}>New users use the existing shared password for this login page.</small>
      <button className="btn btn-primary" type="submit" disabled={busy || !name.trim() || !userId.trim()}>{busy ? 'Please wait…' : 'Add user ID'}</button>
    </form>
    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 16, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}><strong style={{ fontSize: 13 }}>Delete selected user ID</strong><button className="btn btn-ghost" type="button" onClick={() => load()} disabled={busy || loading}>Refresh</button></div>
      {loadError && <p role="alert" style={{ color: '#b91c1c', margin: 0 }}>{loadError}</p>}
      <label style={field}>Existing {title} users ({users.length})
        <select className="input select" value={selected} onChange={e => { setSelected(e.target.value); setError(''); setNotice(''); }} disabled={busy || loading || !!loadError}>
          <option value="">{loading ? 'Loading users…' : 'Select a user ID'}</option>
          {users.map(account => <option key={account.userId} value={account.userId}>{account.name} — {account.userId}</option>)}
        </select>
      </label>
      {selectedUser && <p style={{ fontSize: 12, margin: 0, color: '#64748b' }}>{selectedUser.name} · {selectedUser.centres.join(', ') || 'No centre / office recorded'}</p>}
      {isCurrentUser && <p style={{ fontSize: 12, margin: 0, color: '#92400e' }}>You cannot delete the account you are currently using.</p>}
      <button className="btn" type="button" style={{ background: '#b91c1c', color: '#fff' }} disabled={busy || loading || !!loadError || !selectedUser || isCurrentUser} onClick={remove}>Delete selected user ID</button>
    </div>
    {error && <p role="alert" style={{ color: '#b91c1c', fontSize: 13 }}>{error}</p>}
    {notice && <p role="status" style={{ color: '#166534', fontSize: 13 }}>{notice}</p>}
  </section>;
}
export default function PortalUserManagement() {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return null;
  return <section className="card" aria-label="Manage login users" style={{ padding: 20, marginBottom: 20 }}>
    <h2 style={{ margin: '0 0 6px', color: '#1e3a8a' }}>Manage Login Users</h2>
    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Add a user to the required login page or delete a selected user's access. Login activity history is retained.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18 }}>
      <LoginUsersCard role="centre" title="Centre Login" user={user} />
      <LoginUsersCard role="admin" title="CSRL Management Login" user={user} />
    </div>
  </section>;
}
