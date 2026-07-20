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
import {
  getSettings,
  updateGeneralSettings,
  updateProfile,
  updatePassword,
  updatePreferences,
  updateNotifications,
  updateOpeningHours,
  resetSettings
} from '../../api/resto/settings';
import { getStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../../api/resto/staff';

const tabs = [
  { key: 'general', label: 'General' },
  { key: 'profile', label: 'Profile' },
  { key: 'password', label: 'Password' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'hours', label: 'Opening Hours' },
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
  const notificationsForm = useForm();
  const hoursForm = useForm();
  const staffForm = useForm();

  useEffect(() => {
    getSettings()
      .then(res => {
        const data = res?.data || res || {};
        generalForm.reset(data.general || {});
        profileForm.reset(data.profile || {});
        preferencesForm.reset(data.preferences || {});
        notificationsForm.reset(data.notifications || {});
        hoursForm.reset(data.openingHours || {});
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
    try {
      await updateGeneralSettings(data);
      success('General settings saved');
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleProfileSave = async (data) => {
    setSaving(true);
    try {
      await updateProfile(data);
      success('Profile updated');
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handlePasswordSave = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      success('Password changed');
      passwordForm.reset();
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handlePreferencesSave = async (data) => {
    setSaving(true);
    try {
      await updatePreferences(data);
      success('Preferences saved');
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleNotificationsSave = async (data) => {
    setSaving(true);
    try {
      await updateNotifications(data);
      success('Notification settings saved');
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleHoursSave = async (data) => {
    setSaving(true);
    try {
      await updateOpeningHours(data);
      success('Opening hours saved');
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleResetSettings = async () => {
    if (!confirm('Reset all settings to default?')) return;
    setSaving(true);
    try {
      await resetSettings();
      success('Settings reset to default');
      // Reload settings
      const res = await getSettings();
      const data = res?.data || res || {};
      generalForm.reset(data.general || {});
      preferencesForm.reset(data.preferences || {});
      notificationsForm.reset(data.notifications || {});
      hoursForm.reset(data.openingHours || {});
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
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
    } catch (err) {
      error(err.response?.data?.message || 'Failed');
    }
    setSaving(false);
  };

  const handleDeleteStaff = async (id) => {
    if (!confirm('Remove this staff member?')) return;
    try {
      await deleteStaff(id);
      success('Staff removed');
      setStaff(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      error('Failed');
    }
  };

  const handleToggleStaff = async (id) => {
    try {
      await toggleStaffStatus(id);
      success('Staff status toggled');
      const res = await getStaff();
      setStaff(res?.data || []);
    } catch (err) {
      error('Failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <Button variant="secondary" onClick={handleResetSettings} loading={saving} size="sm">
          Reset to Default
        </Button>
      </div>

      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* General Tab */}
      {activeTab === 'general' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Restaurant Details</h3>
          <form onSubmit={generalForm.handleSubmit(handleGeneralSave)} className="space-y-4">
            <Input label="Restaurant Name" {...generalForm.register('restaurantName')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" {...generalForm.register('phone')} />
              <Input label="Email" type="email" {...generalForm.register('email')} />
            </div>
            <Input label="Address" {...generalForm.register('address')} />
            <Input label="KRA PIN" {...generalForm.register('kraPin')} />
            <Button type="submit" loading={saving}>Save Changes</Button>
          </form>
        </Card>
      )}

      {/* Profile Tab */}
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

      {/* Password Tab */}
      {activeTab === 'password' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              {...passwordForm.register('currentPassword', { required: true })}
            />
            <Input
              label="New Password"
              type="password"
              {...passwordForm.register('newPassword', { required: true, minLength: 8 })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              {...passwordForm.register('confirmPassword', { required: true })}
            />
            <Button type="submit" loading={saving}>Change Password</Button>
          </form>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Restaurant Preferences</h3>
          <form onSubmit={preferencesForm.handleSubmit(handlePreferencesSave)} className="space-y-4 max-w-md">
            <Select
              label="Currency"
              {...preferencesForm.register('currency')}
              options={[
                { value: 'KES', label: 'KES' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' }
              ]}
            />
            <Select
              label="Date Format"
              {...preferencesForm.register('dateFormat')}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
              ]}
            />
            <Input
              label="VAT Rate (%)"
              type="number"
              {...preferencesForm.register('vatRate')}
            />
            <Input
              label="Service Charge (%)"
              type="number"
              {...preferencesForm.register('serviceCharge')}
            />
            <Input
              label="Receipt Footer Message"
              {...preferencesForm.register('receiptFooter')}
              placeholder="Thank you for dining with us!"
            />
            <Button type="submit" loading={saving}>Save Preferences</Button>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
          <form onSubmit={notificationsForm.handleSubmit(handleNotificationsSave)} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Order Email</p>
                  <p className="text-xs text-gray-500">Send email confirmation for new orders</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('orderEmail')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Order SMS</p>
                  <p className="text-xs text-gray-500">Send SMS confirmation for new orders</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('orderSms')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Low Stock Email</p>
                  <p className="text-xs text-gray-500">Alert when stock is low</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('lowStockEmail')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Low Stock SMS</p>
                  <p className="text-xs text-gray-500">SMS alert when stock is low</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('lowStockSms')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Reservation Email</p>
                  <p className="text-xs text-gray-500">Confirm table bookings via email</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('reservationEmail')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">Reservation SMS</p>
                  <p className="text-xs text-gray-500">Confirm table bookings via SMS</p>
                </div>
                <input
                  type="checkbox"
                  {...notificationsForm.register('reservationSms')}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-primary-600"
                />
              </div>
            </div>
            <Button type="submit" loading={saving}>Save Notification Settings</Button>
          </form>
        </Card>
      )}

      {/* Opening Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Opening Hours</h3>
          <form onSubmit={hoursForm.handleSubmit(handleHoursSave)} className="space-y-4 max-w-md">
            <Input
              label="Weekdays (Mon-Fri)"
              {...hoursForm.register('weekdays')}
              placeholder="8:00 AM - 10:00 PM"
            />
            <Input
              label="Weekends (Sat-Sun)"
              {...hoursForm.register('weekends')}
              placeholder="9:00 AM - 11:00 PM"
            />
            <Button type="submit" loading={saving}>Save Opening Hours</Button>
          </form>
        </Card>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Staff Management</h3>
            <Button
              size="sm"
              onClick={() => {
                setEditingStaff(null);
                staffForm.reset({ name: '', email: '', phone: '', role: 'staff', password: '' });
                setShowStaffModal(true);
              }}
            >
              + Add Staff
            </Button>
          </div>

          {staffLoading ? (
            <Spinner />
          ) : staff.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No staff members yet.</p>
          ) : (
            <Table
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role', render: (row) => <Badge>{row.role}</Badge> },
                {
                  key: 'isActive',
                  label: 'Status',
                  render: (row) => (
                    <Badge color={row.isActive ? 'green' : 'red'}>
                      {row.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  )
                },
                {
                  key: 'actions',
                  label: '',
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingStaff(row);
                          staffForm.reset({
                            name: row.name,
                            email: row.email,
                            phone: row.phone || '',
                            role: row.role,
                            password: ''
                          });
                          setShowStaffModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStaff(row._id)}
                      >
                        {row.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteStaff(row._id)}
                        className="text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  )
                }
              ]}
              data={staff}
            />
          )}
        </Card>
      )}

      {/* Staff Modal */}
      <Modal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        title={editingStaff ? 'Edit Staff' : 'Add Staff'}
        size="md"
      >
        <form onSubmit={staffForm.handleSubmit(handleStaffSave)} className="space-y-4">
          <Input label="Full Name" {...staffForm.register('name', { required: true })} />
          <Input label="Email" type="email" {...staffForm.register('email', { required: true })} />
          <Input label="Phone" {...staffForm.register('phone')} />
          <Select
            label="Role"
            {...staffForm.register('role')}
            options={[
              { value: 'owner', label: 'Owner' },
              { value: 'admin', label: 'Admin' },
              { value: 'manager', label: 'Manager' },
              { value: 'cashier', label: 'Cashier' },
              { value: 'staff', label: 'Staff' }
            ]}
          />
          {!editingStaff && (
            <Input label="Password" type="password" {...staffForm.register('password', { required: true, minLength: 8 })} />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowStaffModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingStaff ? 'Update' : 'Add'} Staff
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}