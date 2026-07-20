import { useState, useEffect } from 'react';
import { getLeases, createLease, terminateLease } from '../../api/apartment/leases';
import { getUnits } from '../../api/apartment/units';
import { getTenants } from '../../api/apartment/tenants';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, FileText } from 'lucide-react';

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unitId: '', occupantId: '', startDate: '', endDate: '', rent: '', deposit: '' });
  const { success, error } = useNotification();

  useEffect(() => {
    fetchLeases();
    Promise.all([getUnits(), getTenants()]).then(([u, t]) => { setUnits(u?.data || []); setTenants(t?.data || []); }).catch(() => {});
  }, []);

  const fetchLeases = async () => { setLoading(true); try { const res = await getLeases(); setLeases(res?.data || []); } catch {} finally { setLoading(false); }; };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await createLease({ ...form, rent: Number(form.rent), deposit: Number(form.deposit) }); success('Lease created'); setShowModal(false); fetchLeases(); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleTerminate = async (id) => { if (!confirm('Terminate this lease?')) return; try { await terminateLease(id); success('Terminated'); fetchLeases(); } catch (err) { error('Failed'); } };

  const columns = [
    { key: 'unitId', label: 'Unit', render: (r) => r.unitId?.number || 'N/A' },
    { key: 'occupantId', label: 'Tenant', render: (r) => r.occupantId?.name || 'N/A' },
    { key: 'rent', label: 'Rent', render: (r) => formatCurrency(r.rent) },
    { key: 'startDate', label: 'Start', render: (r) => formatDate(r.startDate) },
    { key: 'endDate', label: 'End', render: (r) => formatDate(r.endDate) },
    { key: 'status', label: 'Status', render: (r) => <Badge color={r.status === 'active' ? 'green' : 'red'}>{r.status}</Badge> },
    { key: 'actions', label: '', render: (r) => r.status === 'active' ? <Button size="sm" variant="ghost" onClick={() => handleTerminate(r._id)} className="text-red-500">Terminate</Button> : null },
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leases</h1><Button onClick={() => { setForm({ unitId: '', occupantId: '', startDate: '', endDate: '', rent: '', deposit: '' }); setShowModal(true); }}><Plus size={18} /> New Lease</Button></div>
      {leases.length === 0 ? <Card className="text-center py-12"><FileText size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No leases</h3></Card> : <Table columns={columns} data={leases} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Lease" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Unit *" value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...units.filter(u => u.status === 'vacant').map(u => ({ value: u._id, label: `${u.number} (${u.type})` }))]} />
          <Select label="Tenant *" value={form.occupantId} onChange={e => setForm({...form, occupantId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...tenants.map(t => ({ value: t._id, label: t.name }))]} />
          <div className="grid grid-cols-2 gap-4"><Input label="Start Date *" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required /><Input label="End Date *" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Rent *" type="number" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} required /><Input label="Deposit" type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} /></div>
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Create Lease</Button></div>
        </form>
      </Modal>
    </div>
  );
}