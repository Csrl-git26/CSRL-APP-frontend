import { ExamScopeProvider, useExamScope } from './context/ExamScopeContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Login from './components/Login';
import DataAdminLogin from './components/DataAdminLogin';
import StudentDashboard from './components/StudentDashboard';
import CentreDashboard from './components/CentreDashboard';
import AdminDashboard from './components/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function AppRoutes() {
  const { user } = useAuth();
  const { stream, branch } = useExamScope();
  const scopeKey = `${user?.role}:${user?.centerCode || ""}:${stream}:${branch}`;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/data-admin" element={<DataAdminLogin />} />
      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={
          user?.role === 'STUDENT' ? <ErrorBoundary><StudentDashboard key={scopeKey} /></ErrorBoundary> :
          user?.role === 'CENTRE' ? <ErrorBoundary><CentreDashboard key={scopeKey} /></ErrorBoundary> :
          <ErrorBoundary><AdminDashboard key={scopeKey} /></ErrorBoundary>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ExamScopeProvider><AppRoutes /></ExamScopeProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
