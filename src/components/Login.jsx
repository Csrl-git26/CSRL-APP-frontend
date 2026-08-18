import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, ShieldCheck, LogIn, AlertCircle, FileText } from 'lucide-react';
import { CENTERS } from '../config/centers';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'student', Icon: GraduationCap, label: 'Student' },
  { key: 'centre',  Icon: Building2,      label: 'Centre'  },
  { key: 'admin',   Icon: ShieldCheck,    label: 'CSRL Management'   },
  { key: 'data_admin', Icon: FileText,    label: 'Admin' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role,     setRole]     = useState('student');
  const [roll,     setRoll]     = useState('');
  const [centre,   setCentre]   = useState(Object.keys(CENTERS)[0] || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'student') {
        const id = roll.trim();
        if (!id) { setError('Enter your roll number.'); return; }
        await login({ role: 'student', id, password: id });
      } else if (role === 'centre') {
        if (!username.trim() || !password) {
          setError('Enter username and password.');
          return;
        }
        await login({ role: 'centre', id: username.trim(), password });
      } else if (role === 'admin') {
        if (!username.trim() || !password) {
          setError('Enter username and password.');
          return;
        }
        await login({ role: 'admin', id: username.trim(), password });
        localStorage.removeItem('subRole');
      } else if (role === 'data_admin') {
        if (!username.trim() || !password) {
          setError('Enter username and password.');
          return;
        }
        await login({ role: 'admin', id: username.trim(), password });
        localStorage.setItem('subRole', 'DATA_ADMIN');
      }
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg,#0d3575 0%,#1a4fa0 60%,#1565c0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
    }}>
      <div style={{
        background: 'transparent',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        width: '100%',
        maxWidth: 430,
        overflow: 'hidden',
      }}>

        {/* Header band */}
        <div style={{
          background: 'linear-gradient(135deg,#0d3575,#1a4fa0)',
          padding: '28px 24px 20px',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', backgroundColor: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/logo_new.jpg" alt="CSRL logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.15) translateY(-6px)' }} />
          </div>
          </div>
          <p style={{ color: '#f5a623', fontSize: 20, fontWeight: 'bold', margin: '6px 0 0' }}>
            प्रगति Dashboard CSRL
          </p>
        </div>

        <div style={{ background: '#fff' }}>
          {/* Role tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eef0f5' }}>
            {ROLES.map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setRole(key); setError(''); setPassword(''); }}
                style={{
                  flex: 1,
                  padding: '12px 6px',
                  border: 'none',
                  background: 'none',
                  fontSize: 13,
                  fontWeight: role === key ? 700 : 500,
                  color: role === key ? '#1a4fa0' : '#9097b1',
                  borderBottom: role === key ? '2.5px solid #1a4fa0' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '20px 24px 18px' }}>
          {role === 'student' && (
            <div className="form-group">
              <label className="label" htmlFor="roll">Roll Number</label>
              <input
                id="roll"
                className="input"
                autoFocus
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
              />
            </div>
          )}

          {role === 'centre' && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="centre-username">Username</label>
                <input
                  id="centre-username"
                  className="input"
                  placeholder="Centre username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="centre-password">Password</label>
                <input
                  id="centre-password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {(role === 'admin' || role === 'data_admin') && (
            <>
              <div className="form-group">
                <label className="label" htmlFor="username">Username</label>
                <input
                  id="username"
                  className="input"
                  placeholder="CSRL Management username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--red-bg)',
              color: 'var(--red)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              marginBottom: 12,
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: 12 }}
          >
            <LogIn size={16} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          </form>

          <div style={{
            textAlign: 'center',
            padding: '0 24px 18px',
            fontSize: 12,
            color: '#9097b1',
            borderTop: '1px solid #f0f0f0',
            paddingTop: 12,
          }}>
            Developed by <strong style={{ color: '#1a4fa0' }}>Academic Department, CSRL</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
