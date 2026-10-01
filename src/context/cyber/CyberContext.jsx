import { createContext, useState, useCallback } from 'react';
import api from '../../api/axios';

export const CyberContext = createContext(null);

export function CyberProvider({ children, tenantId }) {
  const [computers, setComputers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchComputers = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get(`/cyber/computers?tenantId=${tenantId}`); setComputers(res.data || []); } catch {}
    setLoading(false);
  }, [tenantId]);

  const fetchSessions = useCallback(async () => {
    try { const res = await api.get(`/cyber/sessions?tenantId=${tenantId}`); setSessions(res.data || []); } catch {}
  }, [tenantId]);

  const fetchServices = useCallback(async () => {
    try { const res = await api.get(`/cyber/services?tenantId=${tenantId}`); setServices(res.data || []); } catch {}
  }, [tenantId]);

  const fetchPackages = useCallback(async () => {
    try { const res = await api.get(`/cyber/packages?tenantId=${tenantId}`); setPackages(res.data || []); } catch {}
  }, [tenantId]);

  const fetchCustomers = useCallback(async () => {
    try { const res = await api.get(`/cyber/customers?tenantId=${tenantId}`); setCustomers(res.data || []); } catch {}
  }, [tenantId]);

  return (
    <CyberContext.Provider value={{
      computers, sessions, services, packages, customers, loading,
      fetchComputers, fetchSessions, fetchServices, fetchPackages, fetchCustomers,
    }}>
      {children}
    </CyberContext.Provider>
  );
}