import { useState, useEffect } from 'react';
import {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseStats
} from '../../api/resto/expenses';
import { getSuppliers } from '../../api/resto/suppliers';
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
import { Search, Plus, Trash2, Wallet, TrendingDown, Calendar, Printer, Eye } from 'lucide-react';

export default function Expenses() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    type: 'Other',
    description: '',
    amount: '',
    paymentMethod: 'Cash',
    supplierId: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchSuppliers();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getExpenses({ search });
      setExpenses(res?.data || []);
    } catch (err) {
      error('Failed to load expenses');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getExpenseStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res?.data || []);
    } catch (err) {
      console.error('Failed to load suppliers');
    }
  };

  const openCreate = () => {
    setForm({ type: 'Other', description: '', amount: '', paymentMethod: 'Cash', supplierId: '', notes: '' });
    setShowModal(true);
  };

  const viewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      error('Description and amount are required');
      return;
    }
    setSaving(true);
    try {
      await createExpense({
        ...form,
        amount: Number(form.amount)
      });
      success('Expense recorded');
      setShowModal(false);
      fetchData();
      fetchStats();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(id);
      success('Expense deleted');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report - ${businessName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #ef4444; margin: 0; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            .total { font-weight: 700; border-top: 2px solid #ef4444; padding-top: 6px; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h2>${businessName}</h2><p>Expense Report</p><p>${now}</p></div>
          <table>
            <tr><th>ID</th><th>Type</th><th>Description</th><th>Payment</th><th class="text-right">Amount</th><th>Date</th></tr>
            ${expenses.map(e => `
              <tr>
                <td>${e.expenseId || e._id.slice(-6)}</td>
                <td>${e.type}</td>
                <td>${e.description}</td>
                <td>${e.paymentMethod}</td>
                <td class="text-right">${formatCurrency(e.amount)}</td>
                <td>${new Date(e.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
            <tr class="total"><td colspan="4" class="text-right">Total</td><td class="text-right">${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}</td><td></td></tr>
          </table>
          <div class="footer">Generated by RestoManagerKE — ${now}</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={18} /> Print</Button>
          <Button onClick={openCreate}><Plus size={18} /> Record Expense</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <TrendingDown size={20} className="mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.today?.total || 0)}</p>
            <p className="text-xs text-gray-500">Today</p>
          </Card>
          <Card className="text-center">
            <Calendar size={20} className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.month?.total || 0)}</p>
            <p className="text-xs text-gray-500">This Month</p>
          </Card>
          <Card className="text-center">
            <Wallet size={20} className="mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.total?.total || 0)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </Card>
          <Card className="text-center">
            <TrendingDown size={20} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{stats.total?.count || 0}</p>
            <p className="text-xs text-gray-500">Total Transactions</p>
          </Card>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {expenses.length === 0 ? (
        <Card className="text-center py-12">
          <Wallet size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No expenses recorded</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Record Expense</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-mono text-xs">{expense.expenseId || expense._id.slice(-6)}</td>
                  <td className="px-4 py-3"><Badge color="yellow">{expense.type}</Badge></td>
                  <td className="px-4 py-3">{expense.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(expense.amount)}</td>
                  <td className="px-4 py-3">{expense.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(expense.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => viewExpense(expense)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(expense._id)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                        <Trash2 size={16} className="text-red-500" />
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Expense" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Expense Type *"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'Supplier Payment', label: 'Supplier Payment' },
              { value: 'Utility Bill', label: 'Utility Bill' },
              { value: 'Rent', label: 'Rent' },
              { value: 'Equipment', label: 'Equipment' },
              { value: 'Maintenance', label: 'Maintenance' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Salary', label: 'Salary' },
              { value: 'Other', label: 'Other' }
            ]}
          />
          <Input
            label="Description *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input
            label="Amount (KES) *"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'M-PESA', label: 'M-PESA' },
              { value: 'Bank Transfer', label: 'Bank Transfer' }
            ]}
          />
          <Select
            label="Supplier (Optional)"
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            options={[
              { value: '', label: 'None' },
              ...suppliers.map(s => ({ value: s._id, label: s.name }))
            ]}
          />
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Record Expense</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Expense Details" size="md">
        {selectedExpense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">ID</p><p className="font-mono text-sm">{selectedExpense.expenseId || selectedExpense._id}</p></div>
              <div><p className="text-sm text-gray-500">Type</p><Badge color="yellow">{selectedExpense.type}</Badge></div>
              <div><p className="text-sm text-gray-500">Amount</p><p className="text-xl font-bold text-red-600">{formatCurrency(selectedExpense.amount)}</p></div>
              <div><p className="text-sm text-gray-500">Payment</p><p className="font-medium">{selectedExpense.paymentMethod}</p></div>
              <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{new Date(selectedExpense.createdAt).toLocaleString()}</p></div>
              <div><p className="text-sm text-gray-500">Supplier</p><p className="font-medium">{selectedExpense.supplierId?.name || 'N/A'}</p></div>
            </div>
            <div><p className="text-sm text-gray-500">Description</p><p>{selectedExpense.description}</p></div>
            {selectedExpense.notes && <div><p className="text-sm text-gray-500">Notes</p><p>{selectedExpense.notes}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}