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
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { getSettings, updateGeneral, updateProfile, updatePassword, updatePreferences } from '../../api/pharma/settings';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api/pharma/staff';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'profile', label: 'Profile' },
  { key: 'password', label: 'Password' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'staff', label: 'Staff' },
];

export default function Settings() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
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
        const data = res?.data || res || {};
        generalForm.reset(data.general || {});
        profileForm.reset(data.profile || {});
        preferencesForm.reset(data.preferences || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'staff') {
      setStaffLoading(true);
      getStaff()
        .then(res => setStaff(res?.data || []))
        .catch(() => {})
        .finally(() => setStaffLoading(false));
    }
  }, [activeTab]);

  const handleGeneralSave = async (data) => {
    setSaving(true);
    try { await updateGeneral(data); success('General settings saved'); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleProfileSave = async (data) => {
    setSaving(true);
    try { await updateProfile(data); success('Profile updated'); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handlePasswordSave = async (data) => {
    if (data.newPassword !== data.confirmPassword) { error('Passwords do not match'); return; }
    setSaving(true);
    try { await updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }); success('Password changed'); passwordForm.reset(); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handlePreferencesSave = async (data) => {
    setSaving(true);
    try { await updatePreferences(data); success('Preferences saved'); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleStaffSave = async (data) => {
    setSaving(true);
    try {
      if (editingStaff) {
        await updateStaff(editingStaff._id, data);
        success('Staff updated');
      } else {
        await createStaff(data);
        success('Staff added');
      }
      setShowStaffModal(false);
      staffForm.reset();
      const res = await getStaff();
      setStaff(res?.data || []);
    } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try { await deleteStaff(id); success('Staff removed'); setStaff(prev => prev.filter(s => s._id !== id)); } catch (err) { error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pharmacy Details</h3>
          <form onSubmit={generalForm.handleSubmit(handleGeneralSave)} className="space-y-4">
            <Input label="Pharmacy Name" {...generalForm.register('pharmacyName')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" {...generalForm.register('phone')} />
              <Input label="Email" type="email" {...generalForm.register('email')} />
            </div>
            <Input label="Address" {...generalForm.register('address')} />
            <Input label="License Number" {...generalForm.register('licenseNo')} />
            <Button type="submit" loading={saving}>Save Changes</Button>
          </form>
        </Card>
      )}

      {activeTab === 'profile' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <Input label="Full Name" {...profileForm.register('name')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email" type="email" {...profileForm.register('email')} />
              <Input label="Phone" {...profileForm.register('phone')} />
            </div>
            <Button type="submit" loading={saving}>Update Profile</Button>
          </form>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} className="space-y-4 max-w-md">
            <Input label="Current Password" type="password" {...passwordForm.register('currentPassword', { required: true })} />
            <Input label="New Password" type="password" {...passwordForm.register('newPassword', { required: true, minLength: 8 })} />
            <Input label="Confirm New Password" type="password" {...passwordForm.register('confirmPassword', { required: true })} />
            <Button type="submit" loading={saving}>Change Password</Button>
          </form>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Module Preferences</h3>
          <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSave)} className="space-y-4 max-w-md">
            <Select label="Currency" {...preferencesForm.register('currency')}
              options={[{ value: 'KES', label: 'KES' }, { value: 'USD', label: 'USD' }]} />
            <Select label="Date Format" {...preferencesForm.register('dateFormat')}
              options={[{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }]} />
            <Input label="Low Stock Alert" type="number" {...preferencesForm.register('lowStockAlert')} />
            <Input label="Expiry Alert Days" type="number" {...preferencesForm.register('expiryAlertDays')} />
            <Button type="submit" loading={saving}>Save Preferences</Button>
          </form>
        </Card>
      )}

      {activeTab === 'staff' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Staff</h3>
            <Button size="sm" onClick={() => { setEditingStaff(null); staffForm.reset(); setShowStaffModal(true); }}>+ Add Staff</Button>
          </div>
          {staffLoading ? <Spinner /> : staff.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No staff members yet.</p>
          ) : (
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (row) => <Badge>{row.role}</Badge> },
                { key: 'isActive', label: 'Status', render: (row) => <Badge color={row.isActive ? 'green' : 'red'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
                { key: 'actions', label: '', render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingStaff(row); staffForm.reset({ name: row.name, email: row.email, phone: row.phone, role: row.role }); setShowStaffModal(true); }}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteStaff(row._id)} className="text-red-500">Remove</Button>
                  </div>
                )},
              ]}
              data={staff}
            />
          )}
        </Card>
      )}

      <Modal isOpen={showStaffModal} onClose={() => setShowStaffModal(false)} title={editingStaff ? 'Edit Staff' : 'Add Staff'} size="md">
        <form onSubmit={staffForm.handleSubmit(handleStaffSave)} className="space-y-4">
          <Input label="Full Name" {...staffForm.register('name', { required: true })} />
          <Input label="Email" type="email" {...staffForm.register('email', { required: true })} />
          <Input label="Phone" {...staffForm.register('phone')} />
          <Select label="Role" {...staffForm.register('role')}
            options={[{ value: 'pharmacist', label: 'Pharmacist' }, { value: 'cashier', label: 'Cashier' }, { value: 'admin', label: 'Admin' }]} />
          {!editingStaff && <Input label="Password" type="password" {...staffForm.register('password', { required: true })} />}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowStaffModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}