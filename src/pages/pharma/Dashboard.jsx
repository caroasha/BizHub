import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/pharma/reports';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { ExpiryAlerts } from '../../components/pharma/app/ExpiryAlerts';
import { formatCurrency } from '../../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res?.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PharmaSys Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-extrabold text-primary-600">{stats?.totalMedicines || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Medicines</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-extrabold text-red-500">{stats?.lowStock || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Low Stock</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-extrabold text-yellow-500">{stats?.expiringSoon || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Expiring Soon</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-extrabold text-green-500">{formatCurrency(stats?.monthRevenue || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Monthly Revenue</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Today's Sales</h3>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{stats?.todaySales || 0}</p>
          <p className="text-sm text-gray-500">transactions today</p>
        </Card>
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">This Month</h3>
          <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{stats?.monthSales || 0}</p>
          <p className="text-sm text-gray-500">transactions this month</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚠️ Expiry Alerts</h3>
        <ExpiryAlerts />
      </Card>
    </div>
  );
}