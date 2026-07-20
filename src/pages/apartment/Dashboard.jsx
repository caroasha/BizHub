import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/apartment/reports';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';
import { Building, Home, Users, FileText, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    getDashboard().then(res => setStats(res?.data || res)).catch(() => {}).finally(() => setLoading(false));
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const occupancyRate = stats?.units ? Math.round((stats.occupied / stats.units) * 100) : 0;

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">{time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3"><Building size={20} className="text-primary-600" /></div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.properties || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Properties</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3"><Home size={20} className="text-blue-600" /></div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.units || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Units</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3"><Users size={20} className="text-green-600" /></div>
            <p className="text-3xl font-extrabold text-green-600">{stats?.occupied || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Occupied</p>
          </div>
        </Card>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3"><CreditCard size={20} className="text-amber-600" /></div>
            <p className="text-3xl font-extrabold text-amber-600">{formatCurrency(stats?.monthRevenue || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Monthly Revenue</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><TrendingUp size={20} className="text-teal-600" /></div>
            <div><h3 className="font-semibold text-gray-900 dark:text-white">Occupancy</h3><p className="text-xs text-gray-500">Unit utilization</p></div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-extrabold text-teal-600">{occupancyRate}%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-3">
              <div className="bg-teal-500 h-3 rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats?.occupied || 0} of {stats?.units || 0} units occupied</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><FileText size={20} className="text-purple-600" /></div>
            <div><h3 className="font-semibold text-gray-900 dark:text-white">Leases</h3><p className="text-xs text-gray-500">Active agreements</p></div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Active Leases</span><span className="font-bold text-gray-900 dark:text-white">{stats?.activeLeases || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Vacant Units</span><span className="font-bold text-gray-900 dark:text-white">{stats?.vacant || 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Monthly Payments</span><span className="font-bold text-green-600">{stats?.monthPayments || 0}</span></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><AlertTriangle size={20} className="text-red-600" /></div>
            <div><h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3><p className="text-xs text-gray-500">Common tasks</p></div>
          </div>
          <div className="space-y-2">
            <a href="/apartment/tenants" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Users size={18} className="text-blue-500" /><div><p className="text-sm font-medium">Add Tenant</p><p className="text-xs text-gray-500">Register new occupant</p></div></a>
            <a href="/apartment/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><CreditCard size={18} className="text-green-500" /><div><p className="text-sm font-medium">Record Payment</p><p className="text-xs text-gray-500">Log rent collection</p></div></a>
            <a href="/apartment/maintenance" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><AlertTriangle size={18} className="text-orange-500" /><div><p className="text-sm font-medium">Maintenance</p><p className="text-xs text-gray-500">Report an issue</p></div></a>
          </div>
        </Card>
      </div>
    </div>
  );
}