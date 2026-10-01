import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { getSettings, updateGeneral, updateProfile, updatePassword, updatePreferences } from '../../api/cyber/settings';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api/cyber/staff';
import { Plus, Edit, Trash2 } from 'lucide-react';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'profile', label: 'Profile' },
  { key: 'password', label: 'Password' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'staff', label: 'Staff' },
];

export default function Settings() {
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const generalForm = useForm();
  const profileForm = useForm();
  const passwordForm = useForm();
  const preferencesForm = useForm();
  const staffForm = useForm();

  useEffect(() => {
    getSettings()
      .then(res => {
        const d = res?.data || res || {};
        generalForm.reset(d.general || {});
        profileForm.reset(d.profile || {});
        preferencesForm.reset(d.preferences || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'staff') {
      getStaff().then(res => setStaff(res?.data || [])).catch(() => {});
    }
  }, [activeTab]);

  const handleSave = (fn, data, msg) => {
    setSaving(true);
    fn(data).then(() => success(msg)).catch(err => error(err.response?.data?.message || 'Failed')).finally(() => setSaving(false));
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <Card>
          <h3 className="font-semibold mb-4">Café Details</h3>
          <form onSubmit={generalForm.handleSubmit(d => handleSave(updateGeneral, d, 'Saved'))} className="space-y-4">
            <Input label="Café Name" {...generalForm.register('cafeName')} />
            <div className="grid grid-cols-2 gap-4"><Input label="Phone" {...generalForm.register('phone')} /><Input label="Email" type="email" {...generalForm.register('email')} /></div>
            <Input label="Address" {...generalForm.register('address')} />
            <Button type="submit" loading={saving}>Save</Button>
          </form>
        </Card>
      )}

      {activeTab === 'profile' && (
        <Card>
          <h3 className="font-semibold mb-4">Profile</h3>
          <form onSubmit={profileForm.handleSubmit(d => handleSave(updateProfile, d, 'Profile updated'))} className="space-y-4">
            <Input label="Name" {...profileForm.register('name')} />
            <div className="grid grid-cols-2 gap-4"><Input label="Email" type="email" {...profileForm.register('email')} /><Input label="Phone" {...profileForm.register('phone')} /></div>
            <Button type="submit" loading={saving}>Update</Button>
          </form>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <h3 className="font-semibold mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(d => handleSave(updatePassword, d, 'Password changed'))} className="space-y-4 max-w-md">
            <Input label="Current Password" type="password" {...passwordForm.register('currentPassword', { required: true })} />
            <Input label="New Password" type="password" {...passwordForm.register('newPassword', { required: true, minLength: 8 })} />
            <Button type="submit" loading={saving}>Change</Button>
          </form>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <h3 className="font-semibold mb-4">Preferences</h3>
          <form onSubmit={preferencesForm.handleSubmit(d => handleSave(updatePreferences, d, 'Saved'))} className="space-y-4 max-w-md">
            <Select label="Currency" {...preferencesForm.register('currency')} options={[{ value: 'KES', label: 'KES' }, { value: 'USD', label: 'USD' }]} />
            <Input label="Default Hourly Rate" type="number" {...preferencesForm.register('defaultHourlyRate')} />
            <Input label="Session Timeout (min)" type="number" {...preferencesForm.register('sessionTimeout')} />
            <Button type="submit" loading={saving}>Save</Button>
          </form>
        </Card>
      )}

      {activeTab === 'staff' && (
        <Card>
          <div className="flex justify-between mb-4"><h3 className="font-semibold">Staff</h3><Button size="sm" onClick={() => { setEditingStaff(null); staffForm.reset(); setShowStaffModal(true); }}><Plus size={18} /> Add</Button></div>
          {staff.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No staff</p> : (
            <Table columns={[
              { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: r => <Badge>{r.role}</Badge> },
              { key: 'isActive', label: 'Status', render: r => <Badge color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
              { key: 'actions', label: '', render: r => (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingStaff(r); staffForm.reset({ name: r.name, email: r.email, phone: r.phone, role: r.role }); setShowStaffModal(true); }}><Edit size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteStaff(r._id).then(() => { success('Removed'); getStaff().then(res => setStaff(res?.data || [])); })} className="text-red-500"><Trash2 size={14} /></Button>
                </div>
              )},
            ]} data={staff} />
          )}
        </Card>
      )}

      <Modal isOpen={showStaffModal} onClose={() => setShowStaffModal(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'} size="md">
        <form onSubmit={staffForm.handleSubmit(d => {
          const fn = editingStaff ? (data) => updateStaff(editingStaff._id, data) : createStaff;
          handleSave(fn, d, editingStaff ? 'Updated' : 'Added');
          setShowStaffModal(false);
          getStaff().then(res => setStaff(res?.data || []));
        })} className="space-y-4">
          <Input label="Name" {...staffForm.register('name', { required: true })} />
          <Input label="Email" type="email" {...staffForm.register('email', { required: true })} />
          <Input label="Phone" {...staffForm.register('phone')} />
          <Select label="Role" {...staffForm.register('role')} options={[{ value: 'attendant', label: 'Attendant' }, { value: 'admin', label: 'Admin' }]} />
          {!editingStaff && <Input label="Password" type="password" {...staffForm.register('password', { required: true })} />}
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowStaffModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}