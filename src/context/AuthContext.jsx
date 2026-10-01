import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getToken,
  setToken,
  getUser,
  setUser,
  getRefreshToken,
  setRefreshToken,
  clearAuth,
} from '../utils/storage';
import { loginUser } from '../api/public/auth';
import api from '../api/axios';

export const AuthContext = createContext(null);

const MODULE_ROUTES = {
  restaurant: '/resto',
  pharmacy: '/pharma',
  apartment: '/apartment',
  electronics: '/electro',
  cyber: '/cyber',
};

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [tenant, setTenantState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [scope, setScopeState] = useState(null);
  const [invoice, setInvoiceState] = useState(null);
  const [modules, setModulesState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    if (savedToken && savedUser) {
      setTokenState(savedToken);
      setUserState(savedUser);
      setTenantState(savedUser.tenant || null);
      setScopeState(savedUser.scope || null);
      setModulesState(savedUser.modules || []);
    }
    setLoading(false);
  }, []);

  const applySession = useCallback((data) => {
    if (!data) return null;

    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    if (accessToken) {
      setToken(accessToken);
      setTokenState(accessToken);
    }
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    const fullUser = {
      ...(data.user || {}),
      tenant: data.tenant || null,
      scope: data.scope || null,
      modules: data.modules || data.user?.modules || [],
    };

    setUser(fullUser);
    setUserState(fullUser);
    setTenantState(data.tenant || null);
    setScopeState(data.scope || null);
    setInvoiceState(data.invoice || null);
    setModulesState(fullUser.modules);

    return fullUser;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await loginUser(email, password);
      const data = res?.data || res;
      const fullUser = applySession(data);
      return {
        user: fullUser,
        tenant: data.tenant,
        scope: data.scope,
        invoice: data.invoice,
        modules: fullUser?.modules || [],
      };
    },
    [applySession]
  );

  const setSession = useCallback(
    (data) => {
      const fullUser = applySession(data);
      return {
        user: fullUser,
        tenant: data?.tenant,
        scope: data?.scope,
        invoice: data?.invoice,
      };
    },
    [applySession]
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/public/auth/me');
      const data = res?.data || res;
      const fullUser = applySession({
        user: data.user,
        tenant: data.tenant,
        scope: data.scope,
        invoice: data.invoice,
        modules: data.modules || data.user?.modules || [],
      });
      return {
        user: fullUser,
        tenant: data.tenant,
        scope: data.scope,
        invoice: data.invoice,
      };
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuth();
        setTokenState(null);
        setUserState(null);
        setTenantState(null);
        setScopeState(null);
        setInvoiceState(null);
        setModulesState([]);
      }
      throw err;
    }
  }, [applySession]);

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
    setTenantState(null);
    setScopeState(null);
    setInvoiceState(null);
    setModulesState([]);
  }, []);

  const isAuthenticated = !!token && !!user;

  const computeRoute = useCallback(() => {
    if (!scope) return '/login';
    if (scope === 'pending' || scope === 'paid_wait') return '/pending';
    if (scope === 'expired') return '/renewal';
    if (scope === 'rejected' || scope === 'auto_rejected') return '/register';
    if (scope === 'suspended') return '/login';
    if (scope === 'active') {
      const businessType = tenant?.businessType;
      return MODULE_ROUTES[businessType] || '/dashboard';
    }
    return '/login';
  }, [scope, tenant]);

  const value = useMemo(
    () => ({
      user,
      tenant,
      token,
      scope,
      invoice,
      modules,
      isAuthenticated,
      loading,
      login,
      logout,
      refreshUser,
      computeRoute,
      setSession,
      setScope: setScopeState,
      setInvoice: setInvoiceState,
    }),
    [
      user,
      tenant,
      token,
      scope,
      invoice,
      modules,
      isAuthenticated,
      loading,
      login,
      logout,
      refreshUser,
      computeRoute,
      setSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}