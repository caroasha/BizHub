import { createContext, useState, useCallback } from 'react';
import api from '../../api/axios';

export const ElectroContext = createContext(null);

export function ElectroProvider({ children, tenantId }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get(`/electro/products?tenantId=${tenantId}`); setProducts(res.data || []); } catch {}
    setLoading(false);
  }, [tenantId]);

  const fetchSales = useCallback(async () => {
    try { const res = await api.get(`/electro/sales?tenantId=${tenantId}`); setSales(res.data || []); } catch {}
  }, [tenantId]);

  const fetchRepairs = useCallback(async () => {
    try { const res = await api.get(`/electro/repairs?tenantId=${tenantId}`); setRepairs(res.data || []); } catch {}
  }, [tenantId]);

  const fetchSuppliers = useCallback(async () => {
    try { const res = await api.get(`/electro/suppliers?tenantId=${tenantId}`); setSuppliers(res.data || []); } catch {}
  }, [tenantId]);

  return (
    <ElectroContext.Provider value={{
      products, sales, repairs, suppliers, loading,
      fetchProducts, fetchSales, fetchRepairs, fetchSuppliers,
    }}>
      {children}
    </ElectroContext.Provider>
  );
}