import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/cyber/reports';
import { getSessions } from '../../api/cyber/sessions';
import { getSales } from '../../api/cyber/sales';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/format';
import { Printer } from 'lucide-react';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'services', label: 'Services' },
];

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const businessName = user?.businessName || 'Cyber Café';

  useEffect(() => {
    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'sessions') fetchSessions();
    if (activeTab === 'services') fetchServices();
  }, [activeTab, startDate, endDate]);

  const fetchOverview = async () => { setLoading(true); try { const res = await getDashboard(); setStats(res?.data || res); } catch {} finally { setLoading(false); }; };
  const fetchSessions = async () => { setLoading(true); try { const res = await getSessions(); setSessions(res?.data || []); } catch {} finally { setLoading(false); }; };
  const fetchServices = async () => { setLoading(true); try { const res = await getSales({ startDate, endDate, paymentStatus: 'paid' }); setSales(res?.data || []); } catch {} finally { setLoading(false); }; };

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const reportDate = `${formatDate(startDate)} — ${formatDate(endDate)}`;
    let title = '';
    let body = '';

    if (activeTab === 'overview') {
      title = 'Overview Report';
      body = `<div class="summary"><div class="summary-row"><span>Computers:</span><span>${stats?.computers||0}</span></div><div class="summary-row"><span>In Use:</span><span>${stats?.active||0}</span></div><div class="summary-row"><span>Today Sessions:</span><span>${stats?.todaySessions||0}</span></div><div class="summary-row total-row"><span>Monthly Revenue:</span><span>${formatCurrency(stats?.monthRevenue||0)}</span></div></div>`;
    }

    if (activeTab === 'sessions') {
      const total = sessions.reduce((s, r) => s + (r.totalAmount || 0), 0);
      title = 'Sessions Report';
      body = `<div class="summary"><div class="summary-row"><span>Total Sessions:</span><span>${sessions.length}</span></div><div class="summary-row total-row"><span>Total Revenue:</span><span>${formatCurrency(total)}</span></div></div><table><thead><tr><th>Computer</th><th>Customer</th><th>Duration</th><th>Total</th><th>Date</th></tr></thead><tbody>${sessions.map(s=>`<tr><td>${s.computerId?.name||'—'}</td><td>${s.customerName||'—'}</td><td>${s.duration?`${s.duration} hrs`:'Active'}</td><td class="right">${s.totalAmount?formatCurrency(s.totalAmount):'—'}</td><td>${formatDate(s.startTime)}</td></tr>`).join('')}</tbody></table>`;
    }

    if (activeTab === 'services') {
      const total = sales.reduce((s, r) => s + (r.totalAmount || 0), 0);
      title = 'Services Report';
      body = `<div class="summary"><div class="summary-row"><span>Total Sales:</span><span>${sales.length}</span></div><div class="summary-row total-row"><span>Total Revenue:</span><span>${formatCurrency(total)}</span></div></div><table><thead><tr><th>Receipt</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th></tr></thead><tbody>${sales.map(s=>`<tr><td>${s.receiptNumber}</td><td>${s.customerName||'—'}</td><td>${s.items?.length||0}</td><td class="right">${formatCurrency(s.totalAmount)}</td><td>${formatDate(s.createdAt)}</td></tr>`).join('')}</tbody></table>`;
    }

    const html = `<!DOCTYPE html><html><head><title>${title}</title><style>@page{size:A4;margin:12mm;}*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#1e293b;}.header{text-align:center;margin-bottom:14px;border-bottom:2px solid #8b5cf6;padding-bottom:10px;}.header h2{color:#8b5cf6;font-size:18px;}.meta{display:flex;justify-content:space-between;margin-bottom:10px;font-size:9px;color:#64748b;}.summary{background:#f5f3ff;border:1px solid #ddd6fe;border-radius:6px;padding:10px 14px;margin-bottom:12px;}.summary-row{display:flex;justify-content:space-between;padding:3px 0;font-size:10px;border-bottom:1px dotted #ddd6fe;}.summary-row:last-child{border-bottom:0;}.total-row{font-weight:700;font-size:12px;border-top:1px solid #8b5cf6;margin-top:4px;padding-top:6px;}table{width:100%;border-collapse:collapse;}th{text-align:left;padding:5px 6px;border-bottom:2px solid #8b5cf6;font-size:9px;color:#8b5cf6;background:#f5f3ff;}td{padding:4px 6px;border-bottom:1px solid #e2e8f0;font-size:9px;}.right{text-align:right;}.footer{text-align:center;margin-top:16px;font-size:8px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;}</style></head><body><div class="header"><h2>${businessName}</h2><div class="sub">${title}</div></div><div class="meta"><span>Period: ${reportDate}</span><span>Printed: ${now}</span></div>${body}<div class="footer">Generated by DigitalManager &mdash; ${now}</div></body></html>`;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <Button variant="secondary" onClick={handlePrint}><Printer size={16} /> Print A4</Button>
      </div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab !== 'overview' && (
        <div className="flex gap-3 items-end">
          <Input label="From" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="To" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      )}
      {loading ? <Spinner /> : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center"><p className="text-3xl font-extrabold text-primary-600">{stats?.computers||0}</p><p className="text-xs text-gray-500 mt-1">Computers</p></Card>
              <Card className="text-center"><p className="text-3xl font-extrabold text-green-500">{stats?.active||0}</p><p className="text-xs text-gray-500 mt-1">In Use</p></Card>
              <Card className="text-center"><p className="text-3xl font-extrabold text-yellow-500">{stats?.todaySessions||0}</p><p className="text-xs text-gray-500 mt-1">Today</p></Card>
              <Card className="text-center"><p className="text-3xl font-extrabold text-green-600">{formatCurrency(stats?.monthRevenue||0)}</p><p className="text-xs text-gray-500 mt-1">Monthly Revenue</p></Card>
            </div>
          )}
          {activeTab === 'sessions' && (
            <Table columns={[
              { key: 'computerId', label: 'Computer', render: r => r.computerId?.name || '—' },
              { key: 'customerName', label: 'Customer' },
              { key: 'duration', label: 'Duration', render: r => r.duration ? `${r.duration} hrs` : <Badge color="green">Active</Badge> },
              { key: 'totalAmount', label: 'Total', render: r => r.totalAmount ? formatCurrency(r.totalAmount) : '—' },
              { key: 'startTime', label: 'Date', render: r => formatDate(r.startTime) },
            ]} data={sessions} />
          )}
          {activeTab === 'services' && (
            <Table columns={[
              { key: 'receiptNumber', label: 'Receipt' },
              { key: 'customerName', label: 'Customer' },
              { key: 'items', label: 'Items', render: r => r.items?.length || 0 },
              { key: 'totalAmount', label: 'Total', render: r => formatCurrency(r.totalAmount) },
              { key: 'paymentMethod', label: 'Payment', render: r => <span className="capitalize">{r.paymentMethod}</span> },
              { key: 'createdAt', label: 'Date', render: r => formatDate(r.createdAt) },
            ]} data={sales} />
          )}
        </>
      )}
    </div>
  );
}