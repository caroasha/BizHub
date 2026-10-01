import { useState, useEffect } from 'react';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeStats
} from '../../api/resto/employees';
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
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Briefcase, Printer, Eye } from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    name: '',
    position: '',
    department: 'Other',
    email: '',
    phone: '',
    salary: '',
    paymentMethod: 'Bank Transfer',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEmployees({ search });
      setEmployees(res?.data || []);
    } catch (err) {
      error('Failed to load employees');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getEmployeeStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', position: '', department: 'Other', email: '', phone: '', salary: '', paymentMethod: 'Bank Transfer', status: 'Active' });
    setShowModal(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    setForm({
      name: employee.name,
      position: employee.position,
      department: employee.department || 'Other',
      email: employee.email,
      phone: employee.phone,
      salary: employee.salary,
      paymentMethod: employee.paymentMethod || 'Bank Transfer',
      status: employee.status || 'Active'
    });
    setShowModal(true);
  };

  const viewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.position || !form.email || !form.phone || !form.salary) {
      error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, salary: Number(form.salary) };
      if (editing) {
        await updateEmployee(editing._id, data);
        success('Employee updated');
      } else {
        await createEmployee(data);
        success('Employee added');
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
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      success('Employee deleted');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateEmployeeStatus(id, status);
      success(`Status updated to ${status}`);
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Employees - ${businessName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #8b5cf6; margin: 0; font-size: 22px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header"><h2>${businessName}</h2><p>Employee List</p><p>${now}</p></div>
          <table>
            <tr><th>Name</th><th>Position</th><th>Department</th><th>Phone</th><th class="text-right">Salary</th><th>Status</th></tr>
            ${employees.map(e => `
              <tr>
                <td>${e.name}</td>
                <td>${e.position}</td>
                <td>${e.department}</td>
                <td>${e.phone}</td>
                <td class="text-right">${formatCurrency(e.salary)}</td>
                <td>${e.status}</td>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}><Printer size={18} /> Print</Button>
          <Button onClick={openCreate}><Plus size={18} /> Add Employee</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center"><Users size={20} className="mx-auto text-primary-500 mb-2" /><p className="text-2xl font-bold">{stats.total || 0}</p><p className="text-xs text-gray-500">Total</p></Card>
          <Card className="text-center"><UserCheck size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{stats.active || 0}</p><p className="text-xs text-gray-500">Active</p></Card>
          <Card className="text-center"><UserX size={20} className="mx-auto text-red-500 mb-2" /><p className="text-2xl font-bold">{stats.onLeave || 0}</p><p className="text-xs text-gray-500">On Leave</p></Card>
          <Card className="text-center"><Briefcase size={20} className="mx-auto text-purple-500 mb-2" /><p className="text-2xl font-bold">{formatCurrency(stats.monthlySalaryTotal || 0)}</p><p className="text-xs text-gray-500">Monthly Salary</p></Card>
        </div>
      )}

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {employees.length === 0 ? (
        <Card className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No employees</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Add Employee</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-right">Salary</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{employee.name}</td>
                  <td className="px-4 py-3">{employee.position}</td>
                  <td className="px-4 py-3">{employee.department}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(employee.salary)}</td>
                  <td className="px-4 py-3">
                    <Badge color={employee.status === 'Active' ? 'green' : employee.status === 'On Leave' ? 'yellow' : 'red'}>
                      {employee.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button onClick={() => viewEmployee(employee)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => openEdit(employee)} className="p-1.5 rounded hover:bg-gray-100" title="Edit">
                        <Edit size={16} className="text-blue-500" />
                      </button>
                      {employee.status === 'Active' && (
                        <button onClick={() => handleStatusUpdate(employee._id, 'On Leave')} className="p-1.5 rounded hover:bg-gray-100" title="On Leave">
                          <UserX size={16} className="text-yellow-500" />
                        </button>
                      )}
                      {employee.status === 'On Leave' && (
                        <button onClick={() => handleStatusUpdate(employee._id, 'Active')} className="p-1.5 rounded hover:bg-gray-100" title="Active">
                          <UserCheck size={16} className="text-green-500" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(employee._id)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Position *" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} options={[
            { value: 'Kitchen', label: 'Kitchen' }, { value: 'Service', label: 'Service' },
            { value: 'Management', label: 'Management' }, { value: 'Cleaning', label: 'Cleaning' },
            { value: 'Other', label: 'Other' }
          ]} />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Salary (KES) *" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
          <Select label="Payment Method" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} options={[
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'M-PESA', label: 'M-PESA' },
            { value: 'Cash', label: 'Cash' }
          ]} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
            { value: 'Active', label: 'Active' },
            { value: 'On Leave', label: 'On Leave' },
            { value: 'Terminated', label: 'Terminated' }
          ]} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add'} Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Employee Details" size="md">
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{selectedEmployee.name}</p></div>
              <div><p className="text-sm text-gray-500">Position</p><p className="font-medium">{selectedEmployee.position}</p></div>
              <div><p className="text-sm text-gray-500">Department</p><p className="font-medium">{selectedEmployee.department}</p></div>
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedEmployee.email}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedEmployee.phone}</p></div>
              <div><p className="text-sm text-gray-500">Salary</p><p className="font-bold text-green-600">{formatCurrency(selectedEmployee.salary)}</p></div>
              <div><p className="text-sm text-gray-500">Payment Method</p><p className="font-medium">{selectedEmployee.paymentMethod}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge color={selectedEmployee.status === 'Active' ? 'green' : 'yellow'}>{selectedEmployee.status}</Badge></div>
              <div><p className="text-sm text-gray-500">Hire Date</p><p className="font-medium">{new Date(selectedEmployee.hireDate).toLocaleDateString()}</p></div>
              <div><p className="text-sm text-gray-500">Employee ID</p><p className="font-mono text-sm">{selectedEmployee.employeeId}</p></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}