import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DataAdminLogin() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (confirmLogout) {
        logout();
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, logout, navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username.trim() || !password) {
        setError('Enter username and password.');
        return;
      }
      // Log in as Super Admin
      await login({ role: 'admin', id: username.trim(), password });
      
      // Set the flag to restrict view to Data Admin
      localStorage.setItem('subRole', 'DATA_ADMIN');
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src="/logo.png" alt="CSRL logo" className="logo" />
            <div className="app-title">
              <span className="brand-text">CSRL</span>
              <span className="app-name">Data Management</span>
            </div>
          </div>
          <h2 className="login-title">Data Admin Portal</h2>
          <p className="login-subtitle">Sign in with management credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin ID"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="alert-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 10 }}
          >
            {loading ? 'Verifying...' : 'Access Portal'}
            {!loading && <LogIn size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
