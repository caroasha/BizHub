import { createContext, useState, useCallback } from 'react';
import api from '../../api/axios';

export const PharmaContext = createContext(null);

export function PharmaProvider({ children, tenantId }) {
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get(`/pharma/medicines?tenantId=${tenantId}`); setMedicines(res.data || []); } catch {}
    setLoading(false);
  }, [tenantId]);

  const fetchSales = useCallback(async () => {
    try { const res = await api.get(`/pharma/sales?tenantId=${tenantId}`); setSales(res.data || []); } catch {}
  }, [tenantId]);

  const fetchPrescriptions = useCallback(async () => {
    try { const res = await api.get(`/pharma/prescriptions?tenantId=${tenantId}`); setPrescriptions(res.data || []); } catch {}
  }, [tenantId]);

  const fetchSuppliers = useCallback(async () => {
    try { const res = await api.get(`/pharma/suppliers?tenantId=${tenantId}`); setSuppliers(res.data || []); } catch {}
  }, [tenantId]);

  return (
    <PharmaContext.Provider value={{
      medicines, sales, prescriptions, suppliers, loading,
      fetchMedicines, fetchSales, fetchPrescriptions, fetchSuppliers,
    }}>
      {children}
    </PharmaContext.Provider>
  );
}