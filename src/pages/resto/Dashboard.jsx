import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/resto/dashboard';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';
import {
  ShoppingCart,
  DollarSign,
  Wallet,
  TrendingUp,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Package
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res?.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const todayOrders = stats?.todayOrders || 0;
  const todayRevenue = stats?.todayRevenue || 0;
  const todayExpenses = stats?.todayExpenses || 0;
  const accountBalance = stats?.accountBalance || 0;
  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const customerCount = stats?.customerCount || 0;
  const employeeCount = stats?.employeeCount || 0;
  const lowStockCount = stats?.lowStockCount || 0;
  const pendingOrders = stats?.pendingOrders || 0;
  const todayReservations = stats?.todayReservations || 0;
  const revenueGrowth = stats?.revenueGrowth || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-xs text-gray-400 mt-1">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
          {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <ShoppingCart size={20} className="text-primary-600" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{todayOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Orders</p>
            {pendingOrders > 0 && (
              <p className="text-xs text-yellow-500 mt-0.5">{pendingOrders} pending</p>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-green-600">{formatCurrency(todayRevenue)}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Revenue</p>
            {revenueGrowth !== 0 && (
              <p className={`text-xs ${revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'} mt-0.5`}>
                {revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(revenueGrowth)}% vs last month
              </p>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-red-600" />
            </div>
            <p className="text-3xl font-extrabold text-red-600">{formatCurrency(todayExpenses)}</p>
            <p className="text-xs text-gray-500 mt-1">Today's Expenses</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-blue-600">{formatCurrency(accountBalance)}</p>
            <p className="text-xs text-gray-500 mt-1">Account Balance</p>
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <TrendingUp size={20} className="mx-auto text-green-500 mb-2" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyRevenue)}</p>
          <p className="text-xs text-gray-500">Monthly Revenue</p>
        </Card>
        <Card className="text-center">
          <Calendar size={20} className="mx-auto text-purple-500 mb-2" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-500">Total Revenue</p>
        </Card>
        <Card className="text-center">
          <Users size={20} className="mx-auto text-blue-500 mb-2" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{customerCount}</p>
          <p className="text-xs text-gray-500">Total Customers</p>
        </Card>
        <Card className="text-center">
          <Users size={20} className="mx-auto text-primary-500 mb-2" />
          <p className="text-xl font-bold text-gray-900 dark:text-white">{employeeCount}</p>
          <p className="text-xs text-gray-500">Active Employees</p>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockCount > 0 || todayReservations > 0 || pendingOrders > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {lowStockCount > 0 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-yellow-500" />
                <div>
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">{lowStockCount} Low Stock Items</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500">Need reordering</p>
                </div>
              </div>
            </Card>
          )}
          {todayReservations > 0 && (
            <Card className="border-primary-500 bg-primary-50 dark:bg-primary-900/10">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-primary-500" />
                <div>
                  <p className="font-semibold text-primary-700 dark:text-primary-400">{todayReservations} Reservations Today</p>
                  <p className="text-xs text-primary-600 dark:text-primary-500">Tables booked</p>
                </div>
              </div>
            </Card>
          )}
          {pendingOrders > 0 && (
            <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <Clock size={24} className="text-orange-500" />
                <div>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">{pendingOrders} Pending Orders</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500">Need attention</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.slice(0, 5).map((t) => (
                <div key={t._id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{t.customerName}</p>
                    <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <p className="font-bold text-green-600">{formatCurrency(t.totalAmount)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map((o) => (
                <div key={o._id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">#{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{o.customerName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    o.orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                    o.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    o.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {o.orderStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
          )}
        </Card>
      </div>
    </div>
  );
}