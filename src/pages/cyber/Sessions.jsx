import { useState, useEffect } from 'react';
import { getSessions, startSession, endSession } from '../../api/cyber/sessions';
import { getComputers } from '../../api/cyber/computers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Play, Square, Clock, Monitor, User, DollarSign, Timer } from 'lucide-react';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStart, setShowStart] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ computerId: '', customerName: '', customerPhone: '' });
  const { success, error } = useNotification();

  useEffect(() => {
    fetchSessions();
    getComputers().then(res => setComputers((res?.data || []).filter(c => c.status === 'available'))).catch(() => {});
  }, [page]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getSessions({ page, limit: 20 });
      setSessions(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch {} finally { setLoading(false); }
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!form.computerId) { error('Select a computer'); return; }
    setSaving(true);
    try {
      await startSession(form);
      success('Session started');
      setShowStart(false);
      setForm({ computerId: '', customerName: '', customerPhone: '' });
      fetchSessions();
    } catch (err) { error(err.response?.data?.message || 'Failed to start'); }
    setSaving(false);
  };

  const handleEnd = async (id) => {
    if (!confirm('End this session? The total will be calculated.')) return;
    try {
      const res = await endSession(id);
      const data = res?.data || res;
      success(`Session ended. Total: ${formatCurrency(data.totalAmount)}`);
      fetchSessions();
    } catch (err) { error('Failed to end session'); }
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status !== 'active');
  const todayTotal = completedSessions.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const activeCount = activeSessions.length;

  const columns = [
    {
      key: 'computerId', label: 'Computer',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">{r.computerId?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'customerName', label: 'Customer',
      render: (r) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span>{r.customerName || 'Walk-in'}</span>
        </div>
      ),
    },
    {
      key: 'startTime', label: 'Start Time',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span>{formatDate(r.startTime)}</span>
        </div>
      ),
    },
    {
      key: 'duration', label: 'Duration',
      render: (r) => r.duration ? (
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-gray-400" />
          <span>{r.duration} hrs</span>
        </div>
      ) : <Badge color="green">Active</Badge>,
    },
    {
      key: 'totalAmount', label: 'Total',
      render: (r) => r.totalAmount ? (
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-green-500" />
          <span className="font-semibold text-green-600">{formatCurrency(r.totalAmount)}</span>
        </div>
      ) : <span className="text-gray-400">—</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={r.status === 'active' ? 'green' : r.status === 'completed' ? 'blue' : 'red'}>{r.status}</Badge>,
    },
    {
      key: 'actions', label: '',
      render: (r) => r.status === 'active' ? (
        <Button size="sm" onClick={() => handleEnd(r._id)} className="bg-red-500 hover:bg-red-600 text-white"><Square size={14} /> End Session</Button>
      ) : null,
    },
  ];

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <Button onClick={() => { setForm({ computerId: '', customerName: '', customerPhone: '' }); setShowStart(true); }}><Play size={18} /> Start Session</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="text-center">
          <Monitor size={24} className="mx-auto text-green-500 mb-2" />
          <p className="text-3xl font-extrabold text-green-500">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Active Sessions</p>
        </Card>
        <Card className="text-center">
          <Clock size={24} className="mx-auto text-primary-500 mb-2" />
          <p className="text-3xl font-extrabold text-primary-600">{sessions.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Today</p>
        </Card>
        <Card className="text-center">
          <DollarSign size={24} className="mx-auto text-green-600 mb-2" />
          <p className="text-3xl font-extrabold text-green-600">{formatCurrency(todayTotal)}</p>
          <p className="text-xs text-gray-500 mt-1">Revenue Today</p>
        </Card>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sessions yet</h3>
          <p className="text-sm text-gray-500 mt-1">Start a session to begin tracking time.</p>
          <Button onClick={() => { setForm({ computerId: '', customerName: '', customerPhone: '' }); setShowStart(true); }} className="mt-4"><Play size={18} /> Start Session</Button>
        </Card>
      ) : (
        <>
          {activeSessions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🟢 Active Sessions</h3>
              <Table columns={columns} data={activeSessions} />
            </div>
          )}
          {completedSessions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 mt-6">📋 Session History</h3>
              <Table columns={columns} data={completedSessions} />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal isOpen={showStart} onClose={() => setShowStart(false)} title="Start New Session" size="sm">
        <form onSubmit={handleStart} className="space-y-4">
          <Select
            label="Computer *"
            value={form.computerId}
            onChange={e => setForm({ ...form, computerId: e.target.value })}
            required
            options={[{ value: '', label: 'Select a computer...' }, ...computers.map(c => ({ value: c._id, label: `${c.name}${c.specs ? ' - ' + c.specs : ''}` }))]}
          />
          {computers.length === 0 && (
            <p className="text-xs text-yellow-500">No available computers. All may be in use or under maintenance.</p>
          )}
          <Input label="Customer Name" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Walk-in customer" />
          <Input label="Phone" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} placeholder="Optional" />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowStart(false)}>Cancel</Button>
            <Button type="submit" loading={saving} disabled={computers.length === 0}><Play size={16} /> Start Session</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}