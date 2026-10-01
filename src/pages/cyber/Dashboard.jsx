import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/cyber/reports';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';
import { Monitor, Clock, DollarSign, Activity, Users, TrendingUp, Computer, Printer } from 'lucide-react';

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
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <Monitor size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.computers || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Computers</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <Activity size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-extrabold text-green-600">{stats?.active || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Currently In Use</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
              <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-3xl font-extrabold text-yellow-600">{stats?.todaySessions || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Sessions</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <DollarSign size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-extrabold text-green-600">{formatCurrency(stats?.monthRevenue || 0)}</p>
            <p className="text-xs text-gray-500 mt-1">Monthly Revenue</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Computer size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">System Status</h3>
              <p className="text-xs text-gray-500">Real-time overview</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Available</span>
              <span className="text-sm font-bold text-green-600">{stats?.computers - stats?.active || 0} PCs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.computers ? ((stats.computers - stats.active) / stats.computers * 100) : 0}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">In Use</span>
              <span className="text-sm font-bold text-blue-600">{stats?.active || 0} PCs</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats?.computers ? (stats.active / stats.computers * 100) : 0}%` }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
              <p className="text-xs text-gray-500">Today's performance</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Sessions Today</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.todaySessions || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg. per Session</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats?.todaySessions > 0 && stats?.monthRevenue ? formatCurrency(stats.monthRevenue / 30) : formatCurrency(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Monthly Revenue</span>
              <span className="font-bold text-green-600">{formatCurrency(stats?.monthRevenue || 0)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Users size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Services</h3>
              <p className="text-xs text-gray-500">Quick actions</p>
            </div>
          </div>
          <div className="space-y-2">
            <a href="/cyber/sessions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Clock size={18} className="text-primary-500" />
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">Start Session</p><p className="text-xs text-gray-500">Begin time tracking</p></div>
            </a>
            <a href="/cyber/pos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Printer size={18} className="text-teal-500" />
              <div><p className="text-sm font-medium text-gray-900 dark:text-white">POS Services</p><p className="text-xs text-gray-500">Quick service sales</p></div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}