import { useState, useEffect } from 'react';
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  cancelReservation,
  getReservationStats,
  getTodayReservations
} from '../../api/resto/reservations';
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
import {
  Search,
  Plus,
  Calendar,
  Users,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Eye
} from 'lucide-react';

const statusColors = {
  Pending: 'yellow',
  Confirmed: 'green',
  Seated: 'blue',
  'No-show': 'red',
  Cancelled: 'gray'
};

export default function Reservations() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [reservations, setReservations] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    guests: 2,
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    requests: ''
  });

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchToday();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (activeTab !== 'all') params.status = activeTab;
      const res = await getReservations(params);
      setReservations(res?.data || []);
    } catch (err) {
      error('Failed to load reservations');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getReservationStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchToday = async () => {
    try {
      const res = await getTodayReservations();
      setTodayReservations(res?.data || []);
    } catch (err) {
      console.error('Failed to load today\'s reservations');
    }
  };

  const openCreate = () => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      guests: 2,
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      requests: ''
    });
    setShowModal(true);
  };

  const viewReservation = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      error('Name, phone, date and time are required');
      return;
    }
    setSaving(true);
    try {
      await createReservation(form);
      success('Reservation created');
      setShowModal(false);
      fetchData();
      fetchStats();
      fetchToday();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create reservation');
    }
    setSaving(false);
  };

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Mark reservation as ${status}?`)) return;
    try {
      await updateReservationStatus(id, status);
      success(`Reservation ${status}`);
      fetchData();
      fetchStats();
      fetchToday();
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this reservation?')) return;
    const reason = prompt('Reason for cancellation:');
    if (reason === null) return;
    try {
      await cancelReservation(id, { reason });
      success('Reservation cancelled');
      fetchData();
      fetchStats();
      fetchToday();
    } catch (err) {
      error('Failed to cancel');
    }
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reservations - ${businessName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #8b5cf6; margin: 0; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h2>${businessName}</h2><p>Reservations</p><p>${now}</p></div>
          <table>
            <tr><th>Name</th><th>Phone</th><th>Guests</th><th>Date</th><th>Time</th><th>Status</th></tr>
            ${reservations.map(r => `
              <tr>
                <td>${r.name}</td>
                <td>${r.phone}</td>
                <td>${r.guests}</td>
                <td>${new Date(r.date).toLocaleDateString()}</td>
                <td>${r.time}</td>
                <td>${r.status}</td>
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

  // Filter by tab
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Seated', label: 'Seated' },
    { key: 'No-show', label: 'No-show' },
    { key: 'Cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reservations</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={18} /> Print</Button>
          <Button onClick={openCreate}><Plus size={18} /> New Reservation</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center"><Calendar size={20} className="mx-auto text-primary-500 mb-2" /><p className="text-2xl font-bold">{stats.todayReservations || 0}</p><p className="text-xs text-gray-500">Today</p></Card>
          <Card className="text-center"><Users size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{stats.byStatus?.find(s => s._id === 'Confirmed')?.count || 0}</p><p className="text-xs text-gray-500">Confirmed</p></Card>
          <Card className="text-center"><CheckCircle size={20} className="mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{stats.byStatus?.find(s => s._id === 'Seated')?.count || 0}</p><p className="text-xs text-gray-500">Seated</p></Card>
          <Card className="text-center"><Clock size={20} className="mx-auto text-yellow-500 mb-2" /><p className="text-2xl font-bold">{stats.byStatus?.find(s => s._id === 'Pending')?.count || 0}</p><p className="text-xs text-gray-500">Pending</p></Card>
        </div>
      )}

      {/* Today's Reservations */}
      {todayReservations.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📅 Today's Reservations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayReservations.slice(0, 6).map((r) => (
              <div key={r._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.guests} guests at {r.time}</p>
                </div>
                <Badge color={statusColors[r.status] || 'gray'}>{r.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setActiveTab(tab.key); fetchData(); }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search reservations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {reservations.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No reservations</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> New Reservation</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-center">Guests</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{res.name}</td>
                  <td className="px-4 py-3">{res.phone}</td>
                  <td className="px-4 py-3 text-center">{res.guests}</td>
                  <td className="px-4 py-3">{new Date(res.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{res.time}</td>
                  <td className="px-4 py-3">
                    <Badge color={statusColors[res.status] || 'gray'}>{res.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button onClick={() => viewReservation(res)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      {res.status === 'Pending' && (
                        <button onClick={() => handleStatusUpdate(res._id, 'Confirmed')} className="p-1.5 rounded hover:bg-gray-100" title="Confirm">
                          <CheckCircle size={16} className="text-green-500" />
                        </button>
                      )}
                      {res.status === 'Confirmed' && (
                        <button onClick={() => handleStatusUpdate(res._id, 'Seated')} className="p-1.5 rounded hover:bg-gray-100" title="Seated">
                          <Users size={16} className="text-blue-500" />
                        </button>
                      )}
                      {res.status === 'Confirmed' && (
                        <button onClick={() => handleStatusUpdate(res._id, 'No-show')} className="p-1.5 rounded hover:bg-gray-100" title="No-show">
                          <XCircle size={16} className="text-red-500" />
                        </button>
                      )}
                      {res.status !== 'Cancelled' && res.status !== 'No-show' && (
                        <button onClick={() => handleCancel(res._id)} className="p-1.5 rounded hover:bg-gray-100" title="Cancel">
                          <XCircle size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Reservation" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select label="Guests" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} options={[
            { value: 1, label: '1 Person' }, { value: 2, label: '2 People' }, { value: 3, label: '3 People' },
            { value: 4, label: '4 People' }, { value: 5, label: '5 People' }, { value: 6, label: '6+ People' }
          ]} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <Input label="Time *" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </div>
          <Input label="Special Requests" value={form.requests} onChange={(e) => setForm({ ...form, requests: e.target.value })} placeholder="Birthday, Anniversary, etc." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Reservation</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Reservation Details" size="md">
        {selectedReservation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedReservation.name}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedReservation.phone}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedReservation.email || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Guests</p><p className="font-medium">{selectedReservation.guests}</p></div>
              <div><p className="text-sm text-gray-500">Date</p><p className="font-medium">{new Date(selectedReservation.date).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-500">Time</p><p className="font-medium">{selectedReservation.time}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge color={statusColors[selectedReservation.status] || 'gray'}>{selectedReservation.status}</Badge></div>
              <div><p className="text-sm text-gray-500">Created</p><p className="font-medium">{new Date(selectedReservation.createdAt).toLocaleString()}</p></div>
            </div>
            {selectedReservation.requests && (
              <div><p className="text-sm text-gray-500">Special Requests</p><p>{selectedReservation.requests}</p></div>
            )}
            {selectedReservation.notes && (
              <div><p className="text-sm text-gray-500">Notes</p><p>{selectedReservation.notes}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}