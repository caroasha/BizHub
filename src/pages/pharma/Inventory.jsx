import { useState, useEffect } from 'react';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine, adjustStock } from '../../api/pharma/medicines';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/pharma/categories';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/format';
import { BarcodeScanner } from '../../components/pharma/app/BarcodeScanner';
import { Camera, Search, Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';

const tabs = [
  { key: 'medicines', label: 'Medicines' },
  { key: 'categories', label: 'Categories' },
];

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medicines');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', genericName: '', dosage: '', categoryId: '', buyingPrice: '', sellingPrice: '', stock: '', minStockAlert: '5', batchNo: '', expiryDate: '', barcode: '', requiresPrescription: false });
  const [stockForm, setStockForm] = useState({ quantity: 0, reason: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [formCameraOpen, setFormCameraOpen] = useState(false);
  const { success, error } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, catRes] = await Promise.all([getMedicines({ search }), getCategories()]);
      setMedicines(medRes?.data || []);
      setCategories(catRes?.data || []);
    } catch (err) { error('Failed to load data'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', genericName: '', dosage: '', categoryId: '', buyingPrice: '', sellingPrice: '', stock: '', minStockAlert: '5', batchNo: '', expiryDate: '', barcode: '', requiresPrescription: false });
    setFormCameraOpen(false);
    setShowModal(true);
  };

  const openEdit = (med) => {
    setEditing(med);
    setForm({
      name: med.name, genericName: med.genericName || '', dosage: med.dosage || '',
      categoryId: med.categoryId?._id || med.categoryId || '',
      buyingPrice: med.buyingPrice, sellingPrice: med.sellingPrice,
      stock: med.stock, minStockAlert: med.minStockAlert || '5',
      batchNo: med.batchNo || '', expiryDate: med.expiryDate ? med.expiryDate.split('T')[0] : '',
      barcode: med.barcode || '', requiresPrescription: med.requiresPrescription || false,
    });
    setFormCameraOpen(false);
    setShowModal(true);
  };

  const openStockAdjust = (med) => { setEditing(med); setStockForm({ quantity: 0, reason: '' }); setShowStockModal(true); };

  const handleBarcodeScannedForForm = (code) => {
    setForm({ ...form, barcode: code });
    setFormCameraOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, buyingPrice: Number(form.buyingPrice), sellingPrice: Number(form.sellingPrice), stock: Number(form.stock), minStockAlert: Number(form.minStockAlert) };
      if (editing) { await updateMedicine(editing._id, data); success('Medicine updated'); }
      else { await createMedicine(data); success('Medicine added'); }
      setShowModal(false);
      fetchData();
    } catch (err) { error(err.response?.data?.message || 'Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this medicine?')) return;
    try { await deleteMedicine(id); success('Medicine deleted'); fetchData(); } catch (err) { error('Failed to delete'); }
  };

  const handleStockAdjust = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await adjustStock(editing._id, { quantity: Number(stockForm.quantity), reason: stockForm.reason }); success('Stock adjusted'); setShowStockModal(false); fetchData(); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleCategorySave = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;
    try {
      if (editingCategory) { await updateCategory(editingCategory._id, categoryForm); success('Category updated'); }
      else { await createCategory(categoryForm); success('Category added'); }
      setEditingCategory(null); setCategoryForm({ name: '', description: '' });
      const catRes = await getCategories(); setCategories(catRes?.data || []);
    } catch (err) { error('Failed to save category'); }
  };

  const handleCategoryEdit = (cat) => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '' }); };
  const handleCategoryDelete = async (id) => { if (!confirm('Delete this category?')) return; try { await deleteCategory(id); success('Category deleted'); fetchData(); } catch (err) { error('Failed to delete'); } };

  const getExpiryStatus = (date) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return { color: 'red', text: 'Expired' };
    if (days <= 30) return { color: 'yellow', text: `${days}d` };
    return { color: 'green', text: `${days}d` };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        {activeTab === 'medicines' && <Button onClick={openCreate}><Plus size={18} /> Add Medicine</Button>}
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'medicines' && (
        <>
          <div className="max-w-md">
            <BarcodeScanner onSelect={(med) => setSearch(med.barcode || med.name)} />
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Spinner size="lg" /></div>
          ) : medicines.length === 0 ? (
            <Card className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No medicines found</h3>
              <p className="text-sm text-gray-500 mt-1">{search ? 'Try a different search.' : 'Add your first medicine.'}</p>
              {!search && <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Medicine</Button>}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map(med => {
                const expiry = getExpiryStatus(med.expiryDate);
                const isLowStock = med.stock <= med.minStockAlert;
                return (
                  <Card key={med._id} className="hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{med.name}</h3>
                        <p className="text-xs text-gray-500">{med.genericName} {med.dosage && `· ${med.dosage}`}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openStockAdjust(med)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-500" title="Stock"><Package size={16} /></button>
                        <button onClick={() => openEdit(med)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-500" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(med._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><p className="text-gray-500">Stock</p><div className="flex items-center gap-2"><span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{med.stock}</span>{isLowStock && <AlertTriangle size={14} className="text-red-500" />}</div></div>
                      <div><p className="text-gray-500">Price</p><p className="font-bold text-gray-900 dark:text-white">{formatCurrency(med.sellingPrice)}</p></div>
                      {expiry && <div><p className="text-gray-500">Expiry</p><Badge color={expiry.color}>{expiry.text}</Badge></div>}
                      <div><p className="text-gray-500">Category</p><p className="text-gray-900 dark:text-white text-sm">{categories.find(c => c._id === (med.categoryId?._id || med.categoryId))?.name || '—'}</p></div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-2xl">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Medicine Categories</h3>
            <form onSubmit={handleCategorySave} className="flex gap-2 mb-4">
              <Input placeholder="Category name" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required className="flex-1" />
              <Button type="submit" size="sm">{editingCategory ? 'Update' : 'Add'}</Button>
              {editingCategory && <Button variant="secondary" size="sm" type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); }}>Cancel</Button>}
            </form>
            {categories.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">No categories yet.</p> : (
              <div className="space-y-1">
                {categories.map(cat => (
                  <div key={cat._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div><span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>{cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}</div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleCategoryEdit(cat)}><Edit size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleCategoryDelete(cat._id)} className="text-red-500"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Medicine Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Generic Name" value={form.genericName} onChange={e => setForm({ ...form, genericName: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Dosage" value={form.dosage} onChange={e => setForm({ ...form, dosage: e.target.value })} placeholder="500mg" />
            <Select label="Category" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} options={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: c._id, label: c.name }))]} />
            <Input label="Batch No" value={form.batchNo} onChange={e => setForm({ ...form, batchNo: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Buying Price *" type="number" value={form.buyingPrice} onChange={e => setForm({ ...form, buyingPrice: e.target.value })} required />
            <Input label="Selling Price *" type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Stock *" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            <Input label="Low Stock Alert" type="number" value={form.minStockAlert} onChange={e => setForm({ ...form, minStockAlert: e.target.value })} />
            <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
          </div>

          {/* Barcode with camera icon */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">Barcode</label>
            <div className="relative">
              <input
                type="text"
                value={form.barcode}
                onChange={e => setForm({ ...form, barcode: e.target.value })}
                placeholder="Enter or scan barcode..."
                className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="button" onClick={() => setFormCameraOpen(!formCameraOpen)}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${formCameraOpen ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title="Scan barcode">
                <Camera size={16} />
              </button>
            </div>
            {formCameraOpen && (
              <div className="mt-2">
                <BarcodeScanner onSelect={(med) => { setForm({ ...form, barcode: med.barcode || '' }); setFormCameraOpen(false); }} />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.requiresPrescription} onChange={e => setForm({ ...form, requiresPrescription: e.target.checked })} className="rounded" />
            Requires Prescription
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Medicine</Button>
          </div>
        </form>
      </Modal>

      {/* Stock Modal */}
      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title={`Adjust Stock - ${editing?.name}`} size="sm">
        <form onSubmit={handleStockAdjust} className="space-y-4">
          <p className="text-sm text-gray-500">Current stock: <strong>{editing?.stock}</strong></p>
          <Input label="Quantity (+ add, - remove)" type="number" value={stockForm.quantity} onChange={e => setStockForm({ ...stockForm, quantity: e.target.value })} required />
          <Input label="Reason" value={stockForm.reason} onChange={e => setStockForm({ ...stockForm, reason: e.target.value })} placeholder="New shipment, expired, damaged..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowStockModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Adjust Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}