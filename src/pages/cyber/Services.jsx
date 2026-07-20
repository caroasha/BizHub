import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/format';
import { Plus, Trash2, Printer, Search, X, BookOpen } from 'lucide-react';

const categoryOptions = [
  { value: 'printing', label: '🖨️ Printing' },
  { value: 'scanning', label: '📄 Scanning' },
  { value: 'typing', label: '⌨️ Typing' },
  { value: 'binding', label: '📚 Binding' },
  { value: 'lamination', label: '✨ Lamination' },
  { value: 'photocopy', label: '📋 Photocopy' },
  { value: 'other', label: '📦 Other' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'printing', ratePerPage: '', ratePerItem: '', description: '' });
  const { success, error } = useNotification();
  const printRef = useRef(null);
  const [settings, setSettings] = useState(null);

const fetchData = async () => {
  setLoading(true);
  try {
    const [svcRes, setRes] = await Promise.all([
      api.get('/cyber/services'),
      api.get('/cyber/settings'),
    ]);
    setServices(svcRes?.data || []);
    setSettings(setRes?.data || setRes || {});
  } catch {} finally { setLoading(false); }
};
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', category: 'printing', ratePerPage: '', ratePerItem: '', description: '' }); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, category: s.category || 'printing', ratePerPage: s.ratePerPage || '', ratePerItem: s.ratePerItem || '', description: s.description || '' }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { error('Name is required'); return; }
    setSaving(true);
    try {
      const data = { ...form, ratePerPage: parseFloat(form.ratePerPage) || 0, ratePerItem: parseFloat(form.ratePerItem) || 0 };
      if (editing) { await api.put(`/cyber/services/${editing._id}`, data); success('Updated'); }
      else { await api.post('/cyber/services', data); success('Added'); }
      setShowForm(false); fetchData();
    } catch (err) { error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await api.delete(`/cyber/services/${id}`); success('Deleted'); fetchData(); } catch (err) { error('Failed'); }
  };

const handlePrintBrochure = () => {
  const categories = [...new Set(services.map(s => s.category || 'other'))];
  const now = new Date().toLocaleString('en-KE');
  const businessName = settings?.general?.cafeName || 'DigitalManager';
  const address = settings?.general?.address || '';
  const phone = settings?.general?.phone || '';
  const email = settings?.general?.email || '';

  const html = `<!DOCTYPE html><html><head><title>Services Brochure</title>
<style>
  @page{size:A4;margin:15mm;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1e293b;line-height:1.5;}
  .cover{text-align:center;padding:40px 20px;page-break-after:always;}
  .cover-icon{width:80px;height:80px;margin:0 auto 16px;background:linear-gradient(135deg,#8b5cf6,#6d28d9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;}
  .cover h1{font-size:26px;color:#6d28d9;margin:0 0 4px;font-weight:800;}
  .cover .biz-name{font-size:18px;color:#1e293b;margin:0 0 4px;}
  .cover .line{width:80px;height:3px;background:#8b5cf6;margin:12px auto;}
  .cover .address{font-size:11px;color:#64748b;margin:4px 0;}
  .cover .contact{font-size:11px;color:#64748b;}
  .cat-section{margin:20px 0;page-break-inside:avoid;}
  .cat-header{background:linear-gradient(135deg,#f5f3ff,#ede9fe);padding:10px 14px;border-radius:6px 6px 0 0;border:1px solid #ddd6fe;border-bottom:none;}
  .cat-header h3{color:#6d28d9;font-size:14px;margin:0;text-transform:uppercase;letter-spacing:1px;}
  .cat-table{width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none;}
  .cat-table th{text-align:left;padding:8px 10px;background:#fafafa;font-size:10px;color:#64748b;text-transform:uppercase;border-bottom:1px solid #e2e8f0;}
  .cat-table td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:11px;}
  .price{text-align:right;font-weight:700;color:#059669;}
  .footer{text-align:center;margin-top:24px;padding-top:16px;border-top:2px solid #8b5cf6;font-size:9px;color:#94a3b8;}
  .footer strong{color:#6d28d9;}
</style></head><body>

<div class="cover">
  <div class="cover-icon">💻</div>
  <h1>Services Brochure</h1>
  <p class="biz-name">${businessName}</p>
  <div class="line"></div>
  ${address ? `<p class="address">📍 ${address}</p>` : ''}
  ${phone || email ? `<p class="contact">${phone ? '📞 ' + phone + ' ' : ''}${email ? '✉️ ' + email : ''}</p>` : ''}
  <p style="font-size:10px;color:#94a3b8;margin-top:12px;">Printed: ${now}</p>
</div>


${categories.map(cat => {
  const catServices = services.filter(s => (s.category || 'other') === cat);
  const catName = categoryOptions.find(c => c.value === cat)?.label || cat;
  return `
    <div class="cat-section">
      <div class="cat-header"><h3>${catName}</h3></div>
      <table class="cat-table">
        <thead><tr><th style="width:35%;">Service</th><th style="width:30%;">Description</th><th style="width:17%;text-align:right;">Rate/Page</th><th style="width:18%;text-align:right;">Rate/Item</th></tr></thead>
        <tbody>
          ${catServices.map(s => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.description || '—'}</td>
              <td class="price">${s.ratePerPage ? 'KES ' + s.ratePerPage.toLocaleString() : '—'}</td>
              <td class="price">${s.ratePerItem ? 'KES ' + s.ratePerItem.toLocaleString() : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}).join('')}

<div class="footer">
  <p><strong>DigitalManager</strong> &mdash; Professional Cyber Café Management</p>
  <p>Prices are subject to change. Contact us for the latest offers.</p>
  <p>Generated: ${now}</p>
</div>

</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catFilter || s.category === catFilter;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
        <div className="flex gap-2">
          {services.length > 0 && (
            <Button variant="secondary" onClick={handlePrintBrochure}><BookOpen size={18} /> Brochure</Button>
          )}
          <Button onClick={openCreate}><Plus size={18} /> Add Service</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} options={[{ value: '', label: 'All Categories' }, ...categoryOptions]} className="w-full sm:w-48" />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Printer size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No services found</h3>
          <p className="text-sm text-gray-500 mt-1">{search || catFilter ? 'Try a different search.' : 'Add your first service.'}</p>
          {!search && !catFilter && <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Service</Button>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Card key={s._id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{s.name}</h3>
                  <Badge className="mt-1 capitalize">{s.category || 'other'}</Badge>
                </div>
                <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={16} /></button>
              </div>
              {s.description && <p className="text-sm text-gray-500 mb-3">{s.description}</p>}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500">Per Page</p>
                  <p className="font-bold text-green-600">{s.ratePerPage ? formatCurrency(s.ratePerPage) : '—'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-500">Per Item</p>
                  <p className="font-bold text-green-600">{s.ratePerItem ? formatCurrency(s.ratePerItem) : '—'}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => openEdit(s)}>Edit</Button>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Service Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Black & White Printing" required />
              <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={categoryOptions} />
              <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Rate per Page (KES)" type="number" value={form.ratePerPage} onChange={e => setForm({ ...form, ratePerPage: e.target.value })} placeholder="0" />
                <Input label="Rate per Item (KES)" type="number" value={form.ratePerItem} onChange={e => setForm({ ...form, ratePerItem: e.target.value })} placeholder="0" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Service</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}