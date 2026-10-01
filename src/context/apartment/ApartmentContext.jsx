import { createContext, useState, useCallback } from 'react';
import api from '../../api/axios';

export const ApartmentContext = createContext(null);

export function ApartmentProvider({ children, tenantId }) {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get(`/apartment/properties?tenantId=${tenantId}`); setProperties(res.data || []); } catch {}
    setLoading(false);
  }, [tenantId]);

  const fetchUnits = useCallback(async () => {
    try { const res = await api.get(`/apartment/units?tenantId=${tenantId}`); setUnits(res.data || []); } catch {}
  }, [tenantId]);

  const fetchTenants = useCallback(async () => {
    try { const res = await api.get(`/apartment/tenants?tenantId=${tenantId}`); setTenants(res.data || []); } catch {}
  }, [tenantId]);

  const fetchLeases = useCallback(async () => {
    try { const res = await api.get(`/apartment/leases?tenantId=${tenantId}`); setLeases(res.data || []); } catch {}
  }, [tenantId]);

  const fetchPayments = useCallback(async () => {
    try { const res = await api.get(`/apartment/payments?tenantId=${tenantId}`); setPayments(res.data || []); } catch {}
  }, [tenantId]);

  return (
    <ApartmentContext.Provider value={{
      properties, units, tenants, leases, payments, loading,
      fetchProperties, fetchUnits, fetchTenants, fetchLeases, fetchPayments,
    }}>
      {children}
    </ApartmentContext.Provider>
  );
}