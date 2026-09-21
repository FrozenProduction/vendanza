import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStoredUser,
  getUserType,
  login as apiLogin,
  logout as apiLogout,
} from '../api/auth';
import { isAdminDashboardPath } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const navigate = useNavigate();

  const login = useCallback(
    async (email, password) => {
      const { user: loggedUser, redirectTo } = await apiLogin(email, password);
      setUser(loggedUser);
      if (isAdminDashboardPath(redirectTo)) {
        window.location.assign(redirectTo);
        return;
      }
      navigate(redirectTo);
    },
    [navigate],
  );

  const logout = useCallback(() => {
    apiLogout();
    // Navegação completa evita que ProtectedRoute redirecione para /login antes de chegar à home
    window.location.replace('/');
  }, []);

  const value = useMemo(
    () => ({
      user,
      userType: getUserType(user),
      isAuthenticated: Boolean(user && localStorage.getItem('token')),
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
