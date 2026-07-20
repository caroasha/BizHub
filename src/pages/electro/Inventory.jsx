import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, adjustStock } from '../../api/electro/products';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/electro/categories';
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
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, Tags } from 'lucide-react';

const tabs = [
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', model: '', categoryId: '', serialNo: '', buyingPrice: '', sellingPrice: '', stock: '', minStockAlert: '3', warranty: '', warrantyEnd: '', description: '' });
  const [stockForm, setStockForm] = useState({ quantity: 0, reason: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, [search]);

  const fetchData = async () => { setLoading(true); try { const [pRes, cRes] = await Promise.all([getProducts({ search }), getCategories()]); setProducts(pRes?.data || []); setCategories(cRes?.data || []); } catch {} finally { setLoading(false); }; };

  const openCreate = () => { setEditing(null); setForm({ name: '', brand: '', model: '', categoryId: '', serialNo: '', buyingPrice: '', sellingPrice: '', stock: '', minStockAlert: '3', warranty: '', warrantyEnd: '', description: '' }); setShowModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, brand: p.brand||'', model: p.model||'', categoryId: p.categoryId?._id||p.categoryId||'', serialNo: p.serialNo||'', buyingPrice: p.buyingPrice, sellingPrice: p.sellingPrice, stock: p.stock, minStockAlert: p.minStockAlert||'3', warranty: p.warranty||'', warrantyEnd: p.warrantyEnd?p.warrantyEnd.split('T')[0]:'', description: p.description||'' }); setShowModal(true); };
  const openStock = (p) => { setEditing(p); setStockForm({ quantity: 0, reason: '' }); setShowStockModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { const data = { ...form, buyingPrice: Number(form.buyingPrice), sellingPrice: Number(form.sellingPrice), stock: Number(form.stock), minStockAlert: Number(form.minStockAlert) }; if (editing) { await updateProduct(editing._id, data); success('Updated'); } else { await createProduct(data); success('Added'); } setShowModal(false); fetchData(); } catch (err) { error('Failed'); } setSaving(false);
  };

  const handleStock = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await adjustStock(editing._id, { quantity: Number(stockForm.quantity), reason: stockForm.reason }); success('Stock adjusted'); setShowStockModal(false); fetchData(); } catch (err) { error('Failed'); } setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteProduct(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

 const handleCategorySave = async (e) => {
  e.preventDefault();
  if (!categoryForm.name.trim()) return;
  try {
    if (editingCategory) {
      console.log('Updating category:', editingCategory._id, categoryForm);
      const res = await updateCategory(editingCategory._id, categoryForm);
    
      success('Updated');
    } else {
         const res = await createCategory(categoryForm);
           success('Added');
    }
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    const cRes = await getCategories();
   
    setCategories(cRes?.data || []);
  } catch (err) {
      error(err.response?.data?.message || 'Failed');
  }
};
  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>{activeTab === 'products' && <Button onClick={openCreate}><Plus size={18} /> Add Product</Button>}</div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'products' && (
        <>
          <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
          {products.length === 0 ? <Card className="text-center py-12"><Package size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No products</h3></Card> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <Card key={p._id} className="hover:shadow-md">
                  <div className="flex justify-between items-start mb-3"><div><h3 className="font-semibold">{p.name}</h3><p className="text-xs text-gray-500">{p.brand} {p.model}</p></div><Badge color={p.stock <= p.minStockAlert ? 'red' : 'green'}>{p.stock} in stock</Badge></div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3"><div><p className="text-gray-500">Buy</p><p className="font-bold">{formatCurrency(p.buyingPrice)}</p></div><div><p className="text-gray-500">Sell</p><p className="font-bold text-green-600">{formatCurrency(p.sellingPrice)}</p></div></div>
                  {p.serialNo && <p className="text-xs text-gray-400">S/N: {p.serialNo}</p>}
                  <div className="flex gap-2 pt-3 border-t"><Button size="sm" variant="ghost" onClick={() => openStock(p)}><Package size={14} /></Button><Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(p._id)} className="text-red-500"><Trash2 size={14} /></Button></div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-2xl"><Card><h3 className="font-semibold mb-4">Product Categories</h3><form onSubmit={handleCategorySave} className="flex gap-2 mb-4"><Input placeholder="Category name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required className="flex-1" /><Button type="submit" size="sm">{editingCategory ? 'Update' : 'Add'}</Button>{editingCategory && <Button variant="secondary" size="sm" type="button" onClick={() => { setEditingCategory(null); setCategoryForm({ name: '', description: '' }); }}>Cancel</Button>}</form>
          {categories.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">No categories</p> : <div className="space-y-1">{categories.map(c => <div key={c._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><span className="text-sm font-medium">{c.name}</span><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditingCategory(c); setCategoryForm({ name: c.name, description: c.description||'' }); }}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => deleteCategory(c._id).then(() => { success('Deleted'); getCategories().then(res => setCategories(res?.data || [])); })} className="text-red-500"><Trash2 size={14} /></Button></div></div>)}</div>}</Card></div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /><Input label="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-4"><Input label="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /><Select label="Category" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} options={[{ value: '', label: 'None' }, ...categories.map(c => ({ value: c._id, label: c.name }))]} /><Input label="Serial No" value={form.serialNo} onChange={e => setForm({...form, serialNo: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Buying Price *" type="number" value={form.buyingPrice} onChange={e => setForm({...form, buyingPrice: e.target.value})} required /><Input label="Selling Price *" type="number" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})} required /></div>
          <div className="grid grid-cols-3 gap-4"><Input label="Stock *" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required /><Input label="Low Stock Alert" type="number" value={form.minStockAlert} onChange={e => setForm({...form, minStockAlert: e.target.value})} /><Input label="Warranty" value={form.warranty} onChange={e => setForm({...form, warranty: e.target.value})} /></div>
          <Input label="Warranty End Date" type="date" value={form.warrantyEnd} onChange={e => setForm({...form, warrantyEnd: e.target.value})} />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Product</Button></div>
        </form>
      </Modal>

      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title={`Adjust Stock - ${editing?.name}`} size="sm">
        <form onSubmit={handleStock} className="space-y-4"><p className="text-sm text-gray-500">Current: <strong>{editing?.stock}</strong></p><Input label="Quantity (+/-)" type="number" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} required /><Input label="Reason" value={stockForm.reason} onChange={e => setStockForm({...stockForm, reason: e.target.value})} /><div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowStockModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Adjust</Button></div></form>
      </Modal>
    </div>
  );
}