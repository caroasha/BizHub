import { useState, useEffect } from 'react';
import {
  getPayrolls,
  getPayroll,
  createPayroll,
  processAllPayrolls,
  payAllSalaries,
  paySalary,
  deletePayroll,
  getPayrollStats
} from '../../api/resto/payroll';
import { getEmployees } from '../../api/resto/employees';
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
  Printer,
  Eye,
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
    Clock,
  Wallet
} from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const businessName = user?.businessName || 'My Restaurant';
  const currentPeriod = new Date().toISOString().substring(0, 7);

  const [form, setForm] = useState({
    employeeId: '',
    hoursWorked: 160,
    overtime: 0,
    bonus: 0,
    deductions: 0,
    notes: ''
  });

  const [processAllForm, setProcessAllForm] = useState({
    hoursWorked: 160,
    overtime: 0,
    bonus: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchEmployees();
  }, [search, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (activeTab !== 'all') params.status = activeTab;
      const res = await getPayrolls(params);
      setPayrolls(res?.data || []);
    } catch (err) {
      error('Failed to load payroll');
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getPayrollStats();
      setStats(res?.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees({ status: 'Active' });
      setEmployees(res?.data || []);
    } catch (err) {
      console.error('Failed to load employees');
    }
  };

  const openCreate = () => {
    setForm({
      employeeId: '',
      hoursWorked: 160,
      overtime: 0,
      bonus: 0,
      deductions: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const viewPayroll = async (id) => {
    try {
      const res = await getPayroll(id);
      setSelectedPayroll(res?.data);
      setShowDetailModal(true);
    } catch (err) {
      error('Failed to load payroll details');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.employeeId) {
      error('Please select an employee');
      return;
    }
    setSaving(true);
    try {
      await createPayroll(form);
      success('Payroll processed');
      setShowModal(false);
      fetchData();
      fetchStats();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process payroll');
    }
    setSaving(false);
  };

  const handleProcessAll = async (e) => {
    e.preventDefault();
    if (!confirm('Process payroll for all active employees?')) return;
    setSaving(true);
    try {
      const res = await processAllPayrolls(processAllForm);
      success(res?.message || 'All payrolls processed');
      fetchData();
      fetchStats();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to process all');
    }
    setSaving(false);
  };

  const handlePay = async (id) => {
    if (!confirm('Mark this payroll as paid?')) return;
    try {
      await paySalary(id);
      success('Salary marked as paid');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to mark as paid');
    }
  };

  const handlePayAll = async () => {
    if (!confirm('Pay all pending salaries?')) return;
    try {
      const res = await payAllSalaries();
      success(res?.message || 'All salaries paid');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to pay all');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this payroll record?')) return;
    try {
      await deletePayroll(id);
      success('Payroll record deleted');
      fetchData();
      fetchStats();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handlePrint = (payroll) => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip - ${payroll.employeeName}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; max-width: 500px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #8b5cf6; margin: 0; font-size: 22px; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0; }
            .total { font-weight: 700; border-top: 2px solid #8b5cf6; padding-top: 6px; margin-top: 4px; font-size: 16px; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${businessName}</h2>
            <p>PAYSLIP</p>
            <p>${payroll.payPeriod}</p>
          </div>
          <div class="row"><span>Employee</span><span>${payroll.employeeName}</span></div>
          <div class="row"><span>Base Salary</span><span>${formatCurrency(payroll.baseSalary)}</span></div>
          <div class="row"><span>Hours Worked</span><span>${payroll.hoursWorked}</span></div>
          <div class="row"><span>Overtime (${payroll.overtime} hrs)</span><span>${formatCurrency(payroll.overtimePay)}</span></div>
          <div class="row"><span>Bonus</span><span>${formatCurrency(payroll.bonus)}</span></div>
          <div class="row"><span>Deductions</span><span>-${formatCurrency(payroll.deductions)}</span></div>
          <div class="row total"><span>TOTAL PAY</span><span>${formatCurrency(payroll.totalPay)}</span></div>
          <div class="row"><span>Status</span><span>${payroll.status}</span></div>
          ${payroll.paymentDate ? `<div class="row"><span>Payment Date</span><span>${new Date(payroll.paymentDate).toLocaleDateString()}</span></div>` : ''}
          <div class="footer">Generated by RestoManagerKE — ${now}</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=600,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'Pending', label: 'Pending' },
    { key: 'Paid', label: 'Paid' }
  ];

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handlePayAll}><DollarSign size={18} /> Pay All</Button>
          <Button variant="secondary" onClick={() => setShowModal(true)}><Plus size={18} /> Process Payroll</Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center"><Wallet size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.thisPeriod?.total || 0)}</p><p className="text-xs text-gray-500">This Period</p></Card>
          <Card className="text-center"><Users size={20} className="mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{stats.thisPeriod?.count || 0}</p><p className="text-xs text-gray-500">Employees</p></Card>
          <Card className="text-center"><CheckCircle size={20} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{stats.paid || 0}</p><p className="text-xs text-gray-500">Paid</p></Card>
          <Card className="text-center"><Clock size={20} className="mx-auto text-yellow-500 mb-2" /><p className="text-2xl font-bold">{stats.pending || 0}</p><p className="text-xs text-gray-500">Pending</p></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search payroll..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {payrolls.length === 0 ? (
        <Card className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No payroll records</h3>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> Process Payroll</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Period</th>
                <th className="px-4 py-3 text-right">Base Salary</th>
                <th className="px-4 py-3 text-right">Total Pay</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment Date</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                  <td className="px-4 py-3">{p.payPeriod}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(p.baseSalary)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatCurrency(p.totalPay)}</td>
                  <td className="px-4 py-3">
                    <Badge color={p.status === 'Paid' ? 'green' : 'yellow'}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button onClick={() => viewPayroll(p._id)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => handlePrint(p)} className="p-1.5 rounded hover:bg-gray-100" title="Print">
                        <Printer size={16} className="text-gray-500" />
                      </button>
                      {p.status === 'Pending' && (
                        <>
                          <button onClick={() => handlePay(p._id)} className="p-1.5 rounded hover:bg-gray-100" title="Pay">
                            <DollarSign size={16} className="text-green-500" />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded hover:bg-gray-100" title="Delete">
                            <XCircle size={16} className="text-red-500" />
                          </button>
                        </>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Process Payroll" size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Employee *"
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            options={[
              { value: '', label: 'Select Employee' },
              ...employees.map(e => ({ value: e._id, label: `${e.name} - ${formatCurrency(e.salary)}` }))
            ]}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hours Worked" type="number" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })} />
            <Input label="Overtime Hours" type="number" value={form.overtime} onChange={(e) => setForm({ ...form, overtime: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Bonus (KES)" type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
            <Input label="Deductions (KES)" type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
          </div>
          <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Process Payroll</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Payroll Details" size="md">
        {selectedPayroll && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Employee</p><p className="font-medium">{selectedPayroll.employeeName}</p></div>
              <div><p className="text-sm text-gray-500">Period</p><p className="font-medium">{selectedPayroll.payPeriod}</p></div>
              <div><p className="text-sm text-gray-500">Base Salary</p><p className="font-medium">{formatCurrency(selectedPayroll.baseSalary)}</p></div>
              <div><p className="text-sm text-gray-500">Hours Worked</p><p className="font-medium">{selectedPayroll.hoursWorked}</p></div>
              <div><p className="text-sm text-gray-500">Overtime</p><p className="font-medium">{selectedPayroll.overtime} hrs ({formatCurrency(selectedPayroll.overtimePay)})</p></div>
              <div><p className="text-sm text-gray-500">Bonus</p><p className="font-medium">{formatCurrency(selectedPayroll.bonus)}</p></div>
              <div><p className="text-sm text-gray-500">Deductions</p><p className="font-medium text-red-600">-{formatCurrency(selectedPayroll.deductions)}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge color={selectedPayroll.status === 'Paid' ? 'green' : 'yellow'}>{selectedPayroll.status}</Badge></div>
              <div><p className="text-sm text-gray-500">Total Pay</p><p className="text-xl font-bold text-green-600">{formatCurrency(selectedPayroll.totalPay)}</p></div>
              <div><p className="text-sm text-gray-500">Payment Date</p><p className="font-medium">{selectedPayroll.paymentDate ? new Date(selectedPayroll.paymentDate).toLocaleDateString() : 'Not paid'}</p></div>
            </div>
            {selectedPayroll.notes && (
              <div><p className="text-sm text-gray-500">Notes</p><p>{selectedPayroll.notes}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}