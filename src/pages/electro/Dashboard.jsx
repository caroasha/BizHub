import { useState, useEffect } from 'react';
import { getDashboard } from '../../api/electro/reports';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';
import { Package, ShoppingCart, Wrench, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    getDashboard().then(res => setStats(res?.data || res)).catch(() => {}).finally(() => setLoading(false));
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => { const hour = time.getHours(); if (hour < 12) return 'Good Morning'; if (hour < 17) return 'Good Afternoon'; return 'Good Evening'; };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div><p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()}</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1><p className="text-xs text-gray-400 mt-1">{time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden"><div className="absolute top-0 right-0 w-20 h-20 bg-primary-500/10 rounded-bl-full" /><div className="relative"><div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3"><Package size={20} className="text-primary-600" /></div><p className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats?.totalProducts||0}</p><p className="text-xs text-gray-500 mt-1">Products</p></div></Card>
        <Card className="relative overflow-hidden"><div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full" /><div className="relative"><div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3"><AlertTriangle size={20} className="text-yellow-600" /></div><p className="text-3xl font-extrabold text-yellow-600">{stats?.lowStock||0}</p><p className="text-xs text-gray-500 mt-1">Low Stock</p></div></Card>
        <Card className="relative overflow-hidden"><div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" /><div className="relative"><div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3"><ShoppingCart size={20} className="text-blue-600" /></div><p className="text-3xl font-extrabold text-blue-600">{stats?.todaySales||0}</p><p className="text-xs text-gray-500 mt-1">Today Sales</p></div></Card>
        <Card className="relative overflow-hidden"><div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" /><div className="relative"><div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3"><DollarSign size={20} className="text-green-600" /></div><p className="text-3xl font-extrabold text-green-600">{formatCurrency(stats?.monthRevenue||0)}</p><p className="text-xs text-gray-500 mt-1">Monthly Revenue</p></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center"><TrendingUp size={20} className="text-teal-600" /></div><div><h3 className="font-semibold">Quick Stats</h3></div></div><div className="space-y-3"><div className="flex justify-between"><span className="text-sm text-gray-500">Total Products</span><span className="font-bold">{stats?.totalProducts||0}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Active Repairs</span><span className="font-bold">{stats?.activeRepairs||0}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Monthly Revenue</span><span className="font-bold text-green-600">{formatCurrency(stats?.monthRevenue||0)}</span></div></div></Card>
        <Card><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Wrench size={20} className="text-purple-600" /></div><div><h3 className="font-semibold">Repairs</h3></div></div><div className="space-y-3"><div className="flex justify-between"><span className="text-sm text-gray-500">Active</span><span className="font-bold text-blue-600">{stats?.activeRepairs||0}</span></div><div className="flex justify-between"><span className="text-sm text-gray-500">Today Sales</span><span className="font-bold">{stats?.todaySales||0}</span></div></div></Card>
        <Card><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><ShoppingCart size={20} className="text-orange-600" /></div><div><h3 className="font-semibold">Quick Actions</h3></div></div><div className="space-y-2"><a href="/electro/sales" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><ShoppingCart size={18} className="text-blue-500" /><div><p className="text-sm font-medium">POS Sales</p><p className="text-xs text-gray-500">New transaction</p></div></a><a href="/electro/repairs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><Wrench size={18} className="text-green-500" /><div><p className="text-sm font-medium">New Repair</p><p className="text-xs text-gray-500">Log a repair</p></div></a></div></Card>
      </div>
    </div>
  );
}