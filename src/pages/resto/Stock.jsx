import { useState, useEffect } from 'react';
import {
  getStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  recordStockUsage,
  addStock
} from '../../api/resto/stock';
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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, Printer } from 'lucide-react';

export default function Stock() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    name: '',
    category: 'Other',
    unit: 'kg',
    stock: 0,
    minStockAlert: 5,
    costPerUnit: 0,
    sellingPrice: 0,
    supplierId: '',
    batchNo: '',
    expiryDate: '',
    description: ''
  });

  const [usageForm, setUsageForm] = useState({ quantity: 0, reason: '' });
  const [addStockForm, setAddStockForm] = useState({ quantity: 0, costPerUnit: '', batchNo: '', expiryDate: '' });

  useEffect(() => {
    fetchData();
    fetchSuppliers();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getStockItems({ search });
      setItems(res?.data || []);
    } catch (err) {
      error('Failed to load stock');
    }
    setLoading(false);
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
    setEditing(null);
    setForm({
      name: '',
      category: 'Other',
      unit: 'kg',
      stock: 0,
      minStockAlert: 5,
      costPerUnit: 0,
      sellingPrice: 0,
      supplierId: '',
      batchNo: '',
      expiryDate: '',
      description: ''
    });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category || 'Other',
      unit: item.unit || 'kg',
      stock: item.stock,
      minStockAlert: item.minStockAlert || 5,
      costPerUnit: item.costPerUnit || 0,
      sellingPrice: item.sellingPrice || 0,
      supplierId: item.supplierId || '',
      batchNo: item.batchNo || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      description: item.description || ''
    });
    setShowModal(true);
  };

  const openUsage = (item) => {
    setSelectedItem(item);
    setUsageForm({ quantity: 0, reason: '' });
    setShowUsageModal(true);
  };

  const openAddStock = (item) => {
    setSelectedItem(item);
    setAddStockForm({ quantity: 0, costPerUnit: '', batchNo: '', expiryDate: '' });
    setShowAddStockModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        stock: Number(form.stock),
        minStockAlert: Number(form.minStockAlert),
        costPerUnit: Number(form.costPerUnit),
        sellingPrice: Number(form.sellingPrice)
      };
      if (editing) {
        await updateStockItem(editing._id, data);
        success('Stock item updated');
      } else {
        await createStockItem(data);
        success('Stock item added');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this stock item?')) return;
    try {
      await deleteStockItem(id);
      success('Stock item deleted');
      fetchData();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleUsage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordStockUsage(selectedItem._id, usageForm);
      success('Stock usage recorded');
      setShowUsageModal(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addStock(selectedItem._id, addStockForm);
      success('Stock added');
      setShowAddStockModal(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stock Report - ${businessName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #f97316; margin: 0; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            .low { color: #ef4444; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h2>${businessName}</h2><p>Stock Report</p><p>${now}</p></div>
          <table>
            <tr><th>Item</th><th>Category</th><th class="text-right">Stock</th><th class="text-right">Unit</th><th class="text-right">Cost</th><th class="text-right">Total Value</th><th>Status</th></tr>
            ${items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td>${i.category || 'Other'}</td>
                <td class="text-right ${i.stock <= i.minStockAlert ? 'low' : ''}">${i.stock}</td>
                <td class="text-right">${i.unit}</td>
                <td class="text-right">${formatCurrency(i.costPerUnit)}</td>
                <td class="text-right">${formatCurrency(i.stock * i.costPerUnit)}</td>
                <td>${i.stock <= i.minStockAlert ? '⚠️ Low Stock' : '✅ In Stock'}</td>
              </tr>
            `).join('')}
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Management</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={18} /> Print</Button>
          <Button onClick={openCreate}><Plus size={18} /> Add Item</Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search stock..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No stock items</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Stock Item</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isLow = item.stock <= item.minStockAlert;
            const totalValue = item.stock * (item.costPerUnit || 0);
            return (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category || 'Other'}</p>
                  </div>
                  <Badge color={isLow ? 'red' : 'green'}>{isLow ? '⚠️ Low' : '✅ In Stock'}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                  <div><p className="text-gray-500">Stock</p><p className={`font-bold ${isLow ? 'text-red-500' : ''}`}>{item.stock} {item.unit}</p></div>
                  <div><p className="text-gray-500">Cost</p><p className="font-bold">{formatCurrency(item.costPerUnit)}</p></div>
                  <div><p className="text-gray-500">Value</p><p className="font-bold">{formatCurrency(totalValue)}</p></div>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button size="sm" variant="ghost" onClick={() => openAddStock(item)}><TrendingUp size={14} /> Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => openUsage(item)}><Package size={14} /> Use</Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Edit size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)} className="text-red-500"><Trash2 size={14} /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Stock Item' : 'Add Stock Item'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Item Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[
              { value: 'Meat', label: 'Meat' }, { value: 'Vegetables', label: 'Vegetables' },
              { value: 'Dairy', label: 'Dairy' }, { value: 'Beverages', label: 'Beverages' },
              { value: 'Dry Goods', label: 'Dry Goods' }, { value: 'Other', label: 'Other' }
            ]} />
            <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} options={[
              { value: 'kg', label: 'kg' }, { value: 'g', label: 'g' }, { value: 'L', label: 'L' },
              { value: 'ml', label: 'ml' }, { value: 'pcs', label: 'pieces' }, { value: 'boxes', label: 'boxes' }
            ]} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Stock *" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <Input label="Min Stock Alert" type="number" value={form.minStockAlert} onChange={(e) => setForm({ ...form, minStockAlert: e.target.value })} />
            <Input label="Cost Per Unit" type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} />
          </div>
          <Input label="Selling Price" type="number" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Batch No" value={form.batchNo} onChange={(e) => setForm({ ...form, batchNo: e.target.value })} />
            <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Item</Button>
          </div>
        </form>
      </Modal>

      {/* Usage Modal */}
      <Modal isOpen={showUsageModal} onClose={() => setShowUsageModal(false)} title={`Record Usage - ${selectedItem?.name}`} size="sm">
        <form onSubmit={handleUsage} className="space-y-4">
          <p className="text-sm text-gray-500">Current stock: <strong>{selectedItem?.stock} {selectedItem?.unit}</strong></p>
          <Input label="Quantity Used *" type="number" value={usageForm.quantity} onChange={(e) => setUsageForm({ ...usageForm, quantity: e.target.value })} required />
          <Input label="Reason *" value={usageForm.reason} onChange={(e) => setUsageForm({ ...usageForm, reason: e.target.value })} placeholder="e.g., Daily usage, wastage" required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowUsageModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Record Usage</Button>
          </div>
        </form>
      </Modal>

      {/* Add Stock Modal */}
      <Modal isOpen={showAddStockModal} onClose={() => setShowAddStockModal(false)} title={`Add Stock - ${selectedItem?.name}`} size="sm">
        <form onSubmit={handleAddStock} className="space-y-4">
          <p className="text-sm text-gray-500">Current stock: <strong>{selectedItem?.stock} {selectedItem?.unit}</strong></p>
          <Input label="Quantity to Add *" type="number" value={addStockForm.quantity} onChange={(e) => setAddStockForm({ ...addStockForm, quantity: e.target.value })} required />
          <Input label="Cost Per Unit" type="number" value={addStockForm.costPerUnit} onChange={(e) => setAddStockForm({ ...addStockForm, costPerUnit: e.target.value })} />
          <Input label="Batch No" value={addStockForm.batchNo} onChange={(e) => setAddStockForm({ ...addStockForm, batchNo: e.target.value })} />
          <Input label="Expiry Date" type="date" value={addStockForm.expiryDate} onChange={(e) => setAddStockForm({ ...addStockForm, expiryDate: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowAddStockModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}