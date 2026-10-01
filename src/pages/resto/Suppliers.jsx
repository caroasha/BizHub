import { useState, useEffect } from 'react';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
  getSupplierStats
} from '../../api/resto/suppliers';
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
import { Search, Plus, Edit, Trash2, Truck, Package, Phone, Mail, Printer, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function Suppliers() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    products: '',
    paymentTerms: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getSuppliers({ search });
      setSuppliers(res?.data || []);
    } catch (err) {
      error('Failed to load suppliers');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getSupplierStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', contactPerson: '', phone: '', email: '', address: '', products: '', paymentTerms: '', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address || '',
      products: supplier.products,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status || 'Active'
    });
    setShowModal(true);
  };

  const viewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.contactPerson || !form.phone || !form.email || !form.products || !form.paymentTerms) {
      error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateSupplier(editing._id, form);
        success('Supplier updated');
      } else {
        await createSupplier(form);
        success('Supplier added');
      }
      setShowModal(false);
      fetchData();
      fetchStats();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      await deleteSupplier(id);
      success('Supplier deleted');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleSupplierStatus(id);
      success('Supplier status toggled');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to toggle');
    }
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Suppliers - ${businessName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #6366f1; margin: 0; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h2>${businessName}</h2><p>Supplier List</p><p>${now}</p></div>
          <table>
            <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Products</th><th>Payment Terms</th><th>Status</th></tr>
            ${suppliers.map(s => `
              <tr>
                <td>${s.name}</td>
                <td>${s.contactPerson}</td>
                <td>${s.phone}</td>
                <td>${s.email}</td>
                <td>${s.products}</td>
                <td>${s.paymentTerms}</td>
                <td>${s.status}</td>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={18} /> Print</Button>
          <Button onClick={openCreate}><Plus size={18} /> Add Supplier</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="text-center"><Truck size={20} className="mx-auto text-primary-500 mb-2" /><p className="text-2xl font-bold">{stats.total || 0}</p><p className="text-xs text-gray-500">Total Suppliers</p></Card>
          <Card className="text-center"><CheckCircle size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{stats.active || 0}</p><p className="text-xs text-gray-500">Active</p></Card>
          <Card className="text-center"><XCircle size={20} className="mx-auto text-red-500 mb-2" /><p className="text-2xl font-bold">{stats.inactive || 0}</p><p className="text-xs text-gray-500">Inactive</p></Card>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {suppliers.length === 0 ? (
        <Card className="text-center py-12">
          <Truck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No suppliers</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Supplier</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <Card key={supplier._id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{supplier.name}</h3>
                  <p className="text-xs text-gray-500">{supplier.contactPerson}</p>
                </div>
                <Badge color={supplier.status === 'Active' ? 'green' : 'red'}>{supplier.status}</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Phone size={14} /> {supplier.phone}</p>
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Mail size={14} /> {supplier.email}</p>
                <p className="text-gray-500 text-xs"><Package size={14} className="inline mr-1" /> {supplier.products}</p>
              </div>
              <div className="flex gap-2 pt-3 border-t mt-3">
                <Button size="sm" variant="ghost" onClick={() => viewSupplier(supplier)}><Eye size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => openEdit(supplier)}><Edit size={14} /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleToggle(supplier._id)}>
                  {supplier.status === 'Active' ? <XCircle size={14} className="text-red-500" /> : <CheckCircle size={14} className="text-green-500" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(supplier._id)} className="text-red-500"><Trash2 size={14} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Company Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Contact Person *" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Products/Supplies *" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} placeholder="e.g., Meat, Vegetables, Dairy" required />
          <Input label="Payment Terms *" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="e.g., Net 30, Cash on Delivery" required />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
            { value: 'Active', label: 'Active' },
            { value: 'Inactive', label: 'Inactive' }
          ]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Supplier</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Supplier Details" size="md">
        {selectedSupplier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Company</p><p className="font-medium">{selectedSupplier.name}</p></div>
              <div><p className="text-sm text-gray-500">Contact Person</p><p className="font-medium">{selectedSupplier.contactPerson}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedSupplier.phone}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedSupplier.email}</p></div>
              <div><p className="text-sm text-gray-500">Address</p><p className="font-medium">{selectedSupplier.address || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge color={selectedSupplier.status === 'Active' ? 'green' : 'red'}>{selectedSupplier.status}</Badge></div>
            </div>
            <div><p className="text-sm text-gray-500">Products/Supplies</p><p>{selectedSupplier.products}</p></div>
            <div><p className="text-sm text-gray-500">Payment Terms</p><p>{selectedSupplier.paymentTerms}</p></div>
          </div>
        )}
      </Modal>
    </div>
  );
}