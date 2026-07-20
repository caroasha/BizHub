import { useState, useEffect } from 'react';
import {
  getTransactions,
  createTransaction,
  getTransactionStats,
  printReceipt
} from '../../api/resto/transactions';
import { getMenuItems } from '../../api/resto/menu';
import { getCustomers } from '../../api/resto/customers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Printer, Eye, CreditCard, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function Transactions() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [{ menuItemId: '', quantity: 1 }],
    paymentMethod: 'Cash',
    discount: 0,
    notes: ''
  });

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchMenuItems();
    fetchCustomers();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ search });
      setTransactions(res?.data || []);
    } catch (err) {
      error('Failed to load transactions');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getTransactionStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await getMenuItems({ available: true });
      setMenuItems(res?.data || []);
    } catch (err) {
      console.error('Failed to load menu items');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res?.data || []);
    } catch (err) {
      console.error('Failed to load customers');
    }
  };

  const openCreate = () => {
    setForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      items: [{ menuItemId: '', quantity: 1 }],
      paymentMethod: 'Cash',
      discount: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const viewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handlePrint = (transaction) => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.transactionId}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #f97316; margin: 0; font-size: 20px; }
            .header p { margin: 2px 0; color: #64748b; font-size: 11px; }
            .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #e2e8f0; }
            .total { font-weight: 700; border-top: 2px solid #f97316; padding-top: 6px; margin-top: 4px; font-size: 14px; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${businessName}</h2>
            <p>${transaction.transactionId}</p>
            <p>${now}</p>
          </div>
          <p><strong>Customer:</strong> ${transaction.customerName}</p>
          <p><strong>Payment:</strong> ${transaction.paymentMethod}</p>
          <div style="margin: 8px 0;"><strong>Items:</strong></div>
          ${transaction.items.map(i => `<div class="row"><span>${i.name} x${i.quantity}</span><span>${formatCurrency(i.totalPrice)}</span></div>`).join('')}
          ${transaction.discount > 0 ? `<div class="row"><span>Discount</span><span>-${formatCurrency(transaction.discount)}</span></div>` : ''}
          <div class="row total"><span>Total</span><span>${formatCurrency(transaction.totalAmount)}</span></div>
          <div class="footer">Thank you for dining with us!</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validItems = form.items.filter(i => i.menuItemId);
    if (!validItems.length) {
      error('Add at least one item');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        items: validItems,
        discount: Number(form.discount) || 0
      };
      await createTransaction(data);
      success('Sale completed');
      setShowModal(false);
      fetchData();
      fetchStats();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to complete sale');
    }
    setSaving(false);
  };

  const addItemRow = () => {
    setForm({ ...form, items: [...form.items, { menuItemId: '', quantity: 1 }] });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = form.items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m._id === item.menuItemId);
      return sum + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
    const discount = Number(form.discount) || 0;
    return subtotal - discount;
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <Button onClick={openCreate}><Plus size={18} /> New Sale</Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center"><DollarSign size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.todayRevenue || 0)}</p><p className="text-xs text-gray-500">Today</p></Card>
          <Card className="text-center"><CreditCard size={20} className="mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold text-blue-600">{stats.todaySales || 0}</p><p className="text-xs text-gray-500">Today Sales</p></Card>
          <Card className="text-center"><Calendar size={20} className="mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.monthRevenue || 0)}</p><p className="text-xs text-gray-500">This Month</p></Card>
          <Card className="text-center"><TrendingUp size={20} className="mx-auto text-orange-500 mb-2" /><p className="text-2xl font-bold text-orange-600">{stats.monthSales || 0}</p><p className="text-xs text-gray-500">Month Sales</p></Card>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {transactions.length === 0 ? (
        <Card className="text-center py-12">
          <CreditCard size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No transactions</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> New Sale</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-mono text-xs">{t.transactionId || t._id.slice(-6)}</td>
                  <td className="px-4 py-3">{t.customerName}</td>
                  <td className="px-4 py-3 text-center">{t.items?.length || 0}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(t.totalAmount)}</td>
                  <td className="px-4 py-3"><Badge color="green">{t.paymentMethod}</Badge></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => viewTransaction(t)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => handlePrint(t)} className="p-1.5 rounded hover:bg-gray-100" title="Print">
                        <Printer size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Sale" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Customer Name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <Input label="Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
          </div>
          <Input label="Email" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</label>
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={item.menuItemId}
                  onChange={(e) => updateItem(index, 'menuItemId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Item' },
                    ...menuItems.map(m => ({ value: m._id, label: `${m.name} - ${formatCurrency(m.price)}` }))
                  ]}
                  className="flex-1"
                />
                <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)} className="w-20" min="1" />
                <Button type="button" variant="secondary" size="sm" onClick={() => removeItemRow(index)}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addItemRow}>+ Add Item</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} options={[
              { value: 'Cash', label: 'Cash' }, { value: 'M-PESA', label: 'M-PESA' },
              { value: 'Card', label: 'Card' }, { value: 'Bank Transfer', label: 'Bank Transfer' }
            ]} />
            <Input label="Discount (KES)" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Complete Sale</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Transaction Details" size="md">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">ID</p><p className="font-mono text-sm">{selectedTransaction.transactionId}</p></div>
              <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium">{selectedTransaction.customerName}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedTransaction.customerPhone || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Payment</p><p className="font-medium">{selectedTransaction.paymentMethod}</p></div>
              <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString()}</p></div>
              <div><p className="text-sm text-gray-500">Total</p><p className="text-xl font-bold text-green-600">{formatCurrency(selectedTransaction.totalAmount)}</p></div>
            </div>
            {selectedTransaction.discount > 0 && (
              <div><p className="text-sm text-gray-500">Discount</p><p className="font-medium">-{formatCurrency(selectedTransaction.discount)}</p></div>
            )}
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-right">Total</th></tr>
                </thead>
                <tbody>
                  {selectedTransaction.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedTransaction.notes && (
              <div><p className="text-sm text-gray-500">Notes</p><p>{selectedTransaction.notes}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}