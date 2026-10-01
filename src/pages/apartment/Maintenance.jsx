import { useState, useEffect } from 'react';
import { getRequests, createRequest, updateRequest } from '../../api/apartment/maintenance';
import { getUnits } from '../../api/apartment/units';
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
import { Plus, Wrench } from 'lucide-react';

export default function Maintenance() {
  const [requests, setRequests] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unitId: '', issue: '', description: '', priority: 'medium' });
  const { success, error } = useNotification();

  useEffect(() => { fetchRequests(); getUnits().then(res => setUnits(res?.data || [])).catch(() => {}); }, []);

  const fetchRequests = async () => { setLoading(true); try { const res = await getRequests(); setRequests(res?.data || []); } catch {} finally { setLoading(false); }; };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await createRequest(form); success('Request created'); setShowModal(false); fetchRequests(); } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleStatus = async (id, status) => {
    try { await updateRequest(id, { status }); success('Updated'); fetchRequests(); } catch (err) { error('Failed'); }
  };

  const statusColors = { reported: 'yellow', 'in-progress': 'blue', completed: 'green' };
  const priorityColors = { low: 'green', medium: 'yellow', high: 'red', urgent: 'red' };

  const columns = [
    { key: 'unitId', label: 'Unit', render: (r) => r.unitId?.number || 'N/A' },
    { key: 'issue', label: 'Issue' },
    { key: 'priority', label: 'Priority', render: (r) => <Badge color={priorityColors[r.priority]}>{r.priority}</Badge> },
    { key: 'status', label: 'Status', render: (r) => <Badge color={statusColors[r.status]}>{r.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'reported' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'in-progress')} className="text-blue-500">Start</Button>}
        {r.status === 'in-progress' && <Button size="sm" variant="ghost" onClick={() => handleStatus(r._id, 'completed')} className="text-green-500">Complete</Button>}
      </div>
    )},
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance</h1><Button onClick={() => { setForm({ unitId: '', issue: '', description: '', priority: 'medium' }); setShowModal(true); }}><Plus size={18} /> New Request</Button></div>
      {requests.length === 0 ? <Card className="text-center py-12"><Wrench size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No requests</h3></Card> : <Table columns={columns} data={requests} />}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Maintenance Request" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Select label="Unit *" value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...units.map(u => ({ value: u._id, label: `Unit ${u.number}` }))]} />
          <Input label="Issue *" value={form.issue} onChange={e => setForm({...form, issue: e.target.value})} required />
          <Input label="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Submit</Button></div>
        </form>
      </Modal>
    </div>
  );
}