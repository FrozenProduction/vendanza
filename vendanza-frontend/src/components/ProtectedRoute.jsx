import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../api/config';

export default function ProtectedRoute({ children, allowedTypes }) {
  const { user, isAuthenticated, userType } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(userType)) {
    return <Navigate to={getDashboardPath(userType)} replace />;
  }

  return children;
}
