import { createContext, useState, useCallback } from 'react';
import api from '../../api/axios';

export const RestoContext = createContext(null);

export function RestoProvider({ children, tenantId }) {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try { const res = await api.get(`/resto/menu?tenantId=${tenantId}`); setMenu(res.data || []); } catch {}
    setLoading(false);
  }, [tenantId]);

  const fetchOrders = useCallback(async () => {
    try { const res = await api.get(`/resto/orders?tenantId=${tenantId}`); setOrders(res.data || []); } catch {}
  }, [tenantId]);

  const fetchTables = useCallback(async () => {
    try { const res = await api.get(`/resto/tables?tenantId=${tenantId}`); setTables(res.data || []); } catch {}
  }, [tenantId]);

  const addToCart = useCallback((item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prev => prev.filter(i => i._id !== itemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return (
    <RestoContext.Provider value={{
      menu, orders, tables, cart, loading,
      fetchMenu, fetchOrders, fetchTables,
      addToCart, removeFromCart, clearCart,
    }}>
      {children}
    </RestoContext.Provider>
  );
}