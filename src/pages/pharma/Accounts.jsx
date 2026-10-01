import { useState, useEffect, useRef } from 'react';
import { getAccounts, getAccountSummary, createAccount, updateAccount, deleteAccount } from '../../api/pharma/accounts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, Printer, Search } from 'lucide-react';
import api from '../../api/axios';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'income', label: 'Income' },
  { key: 'expense', label: 'Expenses' },
];

export default function Accounts() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'expense', category: 'other', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [pharmaName, setPharmaName] = useState(user?.businessName || 'PharmaSys');

  useEffect(() => {
    api.get('/pharma/settings').then(res => {
      const data = res?.data || res || {};
      setPharmaName(data?.general?.pharmacyName || user?.businessName || 'PharmaSys');
    }).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [page, activeTab, startDate, endDate, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, startDate, endDate };
      if (activeTab !== 'all') params.type = activeTab;
      if (search) params.search = search;
      const [accRes, sumRes] = await Promise.all([getAccounts(params), getAccountSummary({ startDate, endDate })]);
      setAccounts(accRes?.data || []);
      setTotalPages(accRes?.pagination?.totalPages || 1);
      setSummary(sumRes?.data || sumRes || { income: 0, expense: 0, profit: 0 });
    } catch {} finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ type: 'expense', category: 'other', amount: '', description: '', date: new Date().toISOString().split('T')[0] }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ type: a.type, category: a.category, amount: a.amount, description: a.description || '', date: a.date ? a.date.split('T')[0] : '' }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, amount: Number(form.amount) };
      if (editing) { await updateAccount(editing._id, data); success('Updated'); }
      else { await createAccount(data); success('Added'); }
      setShowModal(false); fetchData();
    } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteAccount(id); success('Deleted'); fetchData(); } catch (err) { error('Failed'); } };

  const handlePrintRow = (row) => {
    const now = new Date().toLocaleString('en-KE');
    const html = `<!DOCTYPE html><html><head><title>Transaction</title>
<style>@page{size:A6;margin:6mm;}body{font-family:Arial;font-size:11px;padding:8px;color:#1e293b;}.hdr{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:6px;margin-bottom:10px;}.hdr h3{margin:0;font-size:14px;color:#059669;}.hdr p{font-size:9px;color:#64748b;margin:2px 0 0;}.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:10px;}.lbl{color:#64748b;}.val{font-weight:600;}.amt{font-size:18px;font-weight:700;text-align:right;padding:8px 0;border-top:2px solid #1e293b;margin-top:4px;}.in{color:#16a34a;}.ex{color:#dc2626;}.ftr{text-align:center;margin-top:12px;font-size:8px;color:#94a3b8;border-top:1px dashed #ccc;padding-top:6px;}</style></head><body>
<div class="hdr"><h3>${pharmaName}</h3><p>Transaction Receipt</p></div>
<div class="row"><span class="lbl">Date</span><span class="val">${formatDate(row.date)}</span></div>
<div class="row"><span class="lbl">Type</span><span class="val ${row.type==='income'?'in':'ex'}">${row.type}</span></div>
<div class="row"><span class="lbl">Category</span><span class="val">${row.category}</span></div>
<div class="row"><span class="lbl">Description</span><span class="val">${row.description||'—'}</span></div>
<div class="amt ${row.type==='income'?'in':'ex'}">${row.type==='income'?'+':'-'}${formatCurrency(row.amount)}</div>
<div class="ftr">PharmaSys &mdash; ${now}</div></body></html>`;
    const win = window.open('', '_blank', 'width=350,height=420');
    win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500);
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const reportDate = `${formatDate(startDate)} — ${formatDate(endDate)}`;
    const rowsHtml = accounts.map(a => `<tr><td>${formatDate(a.date)}</td><td class="${a.type==='income'?'in':'ex'}">${a.type}</td><td class="capitalize">${a.category}</td><td>${a.description||'—'}</td><td class="right bold ${a.type==='income'?'in':'ex'}">${a.type==='income'?'+':'-'}${formatCurrency(a.amount)}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><title>Accounts Report</title>
<style>@page{size:A4;margin:12mm;}*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial;font-size:10px;color:#1e293b;}.header{text-align:center;margin-bottom:14px;border-bottom:2px solid #059669;padding-bottom:10px;}.header h2{color:#059669;font-size:18px;margin:0;}.header .sub{font-size:9px;color:#64748b;}.meta{display:flex;justify-content:space-between;margin-bottom:10px;font-size:9px;color:#64748b;}.summary{display:flex;gap:12px;margin-bottom:14px;}.card{flex:1;padding:10px;border-radius:6px;text-align:center;border:1px solid #e2e8f0;}.card h3{font-size:16px;margin:0 0 2px;}.card p{font-size:9px;color:#64748b;margin:0;}.green{background:#f0fdf4;border-color:#bbf7d0;}.green h3{color:#16a34a;}.red{background:#fef2f2;border-color:#fecaca;}.red h3{color:#dc2626;}.blue{background:#eff6ff;border-color:#bfdbfe;}.blue h3{color:#1d4ed8;}table{width:100%;border-collapse:collapse;}th{text-align:left;padding:5px 6px;border-bottom:2px solid #059669;font-size:9px;color:#059669;background:#f0fdf4;}td{padding:4px 6px;border-bottom:1px solid #e2e8f0;font-size:9px;}.right{text-align:right;}.bold{font-weight:600;}.capitalize{text-transform:capitalize;}.in{color:#16a34a;}.ex{color:#dc2626;}.footer{text-align:center;margin-top:16px;font-size:8px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;}</style></head><body>
<div class="header"><h2>${pharmaName}</h2><div class="sub">Accounts Report</div></div>
<div class="meta"><span>Period: ${reportDate}</span><span>Printed: ${now}</span></div>
<div class="summary"><div class="card green"><h3>${formatCurrency(summary.income)}</h3><p>Total Income</p></div><div class="card red"><h3>${formatCurrency(summary.expense)}</h3><p>Total Expenses</p></div><div class="card blue"><h3>${formatCurrency(summary.profit)}</h3><p>Net Profit</p></div></div>
<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th class="right">Amount</th></tr></thead><tbody>${rowsHtml||'<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px;">No entries</td></tr>'}</tbody></table>
<div class="footer">Generated by PharmaSys &mdash; ${now}</div></body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500);
  };

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'type', label: 'Type', render: (r) => <Badge color={r.type === 'income' ? 'green' : 'red'}>{r.type}</Badge> },
    { key: 'category', label: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
    { key: 'description', label: 'Description' },
    { key: 'amount', label: 'Amount', render: (r) => <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}</span> },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => handlePrintRow(r)} title="Print Receipt"><Printer size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => openEdit(r)} title="Edit"><Edit size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => handleDelete(r._id)} className="text-red-500" title="Delete"><Trash2 size={14} /></Button>
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={16} /> Print Report</Button>
          <Button onClick={openCreate}><Plus size={18} /> Add Entry</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full" /><TrendingUp size={24} className="mx-auto text-green-500 mb-2 relative" /><p className="text-2xl font-extrabold text-green-600 relative">{formatCurrency(summary.income)}</p><p className="text-xs text-gray-500 relative">Income</p></Card>
        <Card className="text-center relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-bl-full" /><TrendingDown size={24} className="mx-auto text-red-500 mb-2 relative" /><p className="text-2xl font-extrabold text-red-600 relative">{formatCurrency(summary.expense)}</p><p className="text-xs text-gray-500 relative">Expenses</p></Card>
        <Card className="text-center relative overflow-hidden"><div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/10 rounded-bl-full" /><DollarSign size={24} className="mx-auto text-primary-500 mb-2 relative" /><p className={`text-2xl font-extrabold relative ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(summary.profit)}</p><p className="text-xs text-gray-500 relative">Profit</p></Card>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="flex-1" />
        <div className="relative w-48"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" /></div>
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36" />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36" />
      </div>

      {accounts.length === 0 ? (
        <Card className="text-center py-12"><DollarSign size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" /><h3 className="text-lg font-medium">No entries found</h3><p className="text-sm text-gray-500 mt-1">Add your first transaction or adjust filters.</p></Card>
      ) : (
        <><Table columns={columns} data={accounts} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Entry' : 'Add Entry'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} />
          <Select label="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} options={[{ value: 'sales', label: 'Sales' }, { value: 'purchase', label: 'Purchase' }, { value: 'rent', label: 'Rent' }, { value: 'utilities', label: 'Utilities' }, { value: 'salaries', label: 'Salaries' }, { value: 'supplies', label: 'Supplies' }, { value: 'other', label: 'Other' }]} />
          <Input label="Amount *" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}