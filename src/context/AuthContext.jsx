import { createContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, removeToken, getUser, setUser, removeUser, getRefreshToken, setRefreshToken, clearAuth } from '../utils/storage';
import { loginUser } from '../api/public/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setTokenState(savedToken);
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    const data = res?.data || res;
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken;
    const userData = data.user;
    const tenantData = data.tenant;
    const modules = data.modules || [];

    if (!accessToken) throw new Error('No token received');

    const fullUser = { ...userData, businessName: tenantData?.businessName, modules };

    setToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(fullUser);
    setTokenState(accessToken);
    setUserState(fullUser);

    return { user: fullUser, tenant: tenantData, modules };
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}