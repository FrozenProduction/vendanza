import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home';
import Escola from './pages/public/Escola';
import Login from './pages/auth/Login';
import GuardianDashboard from './pages/dashboards/GuardianDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRedirect from './pages/admin/AdminRedirect';
import { USER_TYPES } from './api/config';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/escola" element={<Escola />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/portal/*"
        element={
          <ProtectedRoute allowedTypes={[USER_TYPES.GUARDIAN]}>
            <GuardianDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/professor/*"
        element={
          <ProtectedRoute allowedTypes={[USER_TYPES.TEACHER]}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin: HTML legado (fora da SPA React) */}
      <Route path="/admin/*" element={<AdminRedirect />} />

      {/* Rotas legadas — redirecionamento */}
      <Route path="/dashboard.html" element={<Navigate to="/portal" replace />} />
      <Route path="/teacherdashboard.html" element={<Navigate to="/professor" replace />} />
      <Route path="/login.html" element={<Navigate to="/login" replace />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/escola.html" element={<Navigate to="/escola" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
