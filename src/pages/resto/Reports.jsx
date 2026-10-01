import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency } from '../../utils/format';
import {
  getSalesReport,
  getExpenseReport,
  getInventoryReport,
  getPayrollReport,
  getGeneralReport
} from '../../api/resto/reports';
import { Printer, FileText, TrendingUp, Wallet, Package, Users, Calendar } from 'lucide-react';

export default function Reports() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('general');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));

  const businessName = user?.businessName || 'My Restaurant';

  const reportTypes = [
    { key: 'general', label: 'General', icon: FileText, color: 'primary' },
    { key: 'sales', label: 'Sales', icon: TrendingUp, color: 'green' },
    { key: 'expenses', label: 'Expenses', icon: Wallet, color: 'red' },
    { key: 'inventory', label: 'Inventory', icon: Package, color: 'yellow' },
    { key: 'payroll', label: 'Payroll', icon: Users, color: 'purple' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      switch (activeReport) {
        case 'sales':
          res = await getSalesReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          break;
        case 'expenses':
          res = await getExpenseReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          break;
        case 'inventory':
          res = await getInventoryReport();
          break;
        case 'payroll':
          res = await getPayrollReport({ period });
          break;
        default:
          res = await getGeneralReport({ startDate: dateRange.startDate, endDate: dateRange.endDate });
      }
      setReportData(res?.data || res);
      success('Report generated');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to generate report');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    if (!reportData) return;

    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${activeReport.toUpperCase()} Report</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #f97316; margin: 0; font-size: 22px; }
            .header p { margin: 4px 0; color: #64748b; font-size: 12px; }
            .summary { background: #fff7ed; padding: 12px 16px; border-radius: 6px; margin-bottom: 14px; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #fed7aa; }
            .row:last-child { border-bottom: none; }
            .total { font-weight: 700; border-top: 2px solid #f97316; padding-top: 6px; margin-top: 4px; }
            .section { margin-bottom: 16px; }
            .section h3 { color: #334155; font-size: 13px; margin: 0 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #f1f5f9; text-align: left; padding: 4px 6px; border-bottom: 1px solid #e2e8f0; }
            td { padding: 4px 6px; border-bottom: 1px solid #f1f5f9; }
            .text-right { text-align: right; }
            .footer { text-align: center; margin-top: 16px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${businessName}</h2>
            <p>${activeReport.toUpperCase()} Report</p>
            <p>Generated: ${now}</p>
          </div>

          <div class="summary">
            <div class="row"><span>Report Type</span><span>${activeReport.toUpperCase()}</span></div>
            ${dateRange.startDate && dateRange.endDate ? `
              <div class="row"><span>Period</span><span>${dateRange.startDate} to ${dateRange.endDate}</span></div>
            ` : ''}
            ${period ? `<div class="row"><span>Period</span><span>${period}</span></div>` : ''}
          </div>

          <div class="section">
            <h3>Summary</h3>
            ${renderReportData(reportData)}
          </div>

          <div class="footer">
            Generated by BizHub RestoManager — ${now}
          </div>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const renderReportData = (data) => {
    if (!data) return '<p>No data available</p>';

    let html = '';

    // General Report
    if (activeReport === 'general' && data.revenue) {
      html += `
        <div class="row"><span>Total Revenue</span><span>${formatCurrency(data.revenue?.total || 0)}</span></div>
        <div class="row"><span>Total Expenses</span><span>${formatCurrency(data.expenses?.total || 0)}</span></div>
        <div class="row total"><span>Net Profit</span><span>${formatCurrency((data.revenue?.total || 0) - (data.expenses?.total || 0))}</span></div>
        <div class="row"><span>Total Orders</span><span>${data.revenue?.count || 0}</span></div>
        <div class="row"><span>New Customers</span><span>${data.customers?.new || 0}</span></div>
        <div class="row"><span>Active Employees</span><span>${data.employees || 0}</span></div>
      `;
    }

    // Sales Report
    if (activeReport === 'sales' && data.summary) {
      html += `
        <div class="row"><span>Total Revenue</span><span>${formatCurrency(data.summary?.totalRevenue || 0)}</span></div>
        <div class="row"><span>Total Orders</span><span>${data.summary?.totalOrders || 0}</span></div>
        <div class="row"><span>Average Order Value</span><span>${formatCurrency(data.summary?.averageOrder || 0)}</span></div>
        <div class="row total"><span>Total Revenue</span><span>${formatCurrency(data.summary?.totalRevenue || 0)}</span></div>
      `;
      if (data.byPaymentMethod?.length) {
        html += `<div style="margin-top:8px;"><p style="font-weight:600;font-size:10px;margin:4px 0;">By Payment Method:</p>`;
        data.byPaymentMethod.forEach(item => {
          html += `<div class="row"><span>${item._id}</span><span>${formatCurrency(item.total)} (${item.count})</span></div>`;
        });
        html += `</div>`;
      }
    }

    // Expenses Report
    if (activeReport === 'expenses' && data.summary) {
      html += `
        <div class="row"><span>Total Expenses</span><span>${formatCurrency(data.summary?.totalAmount || 0)}</span></div>
        <div class="row"><span>Total Transactions</span><span>${data.summary?.totalExpenses || 0}</span></div>
        <div class="row"><span>Average Expense</span><span>${formatCurrency(data.summary?.averageExpense || 0)}</span></div>
      `;
      if (data.byType?.length) {
        html += `<div style="margin-top:8px;"><p style="font-weight:600;font-size:10px;margin:4px 0;">By Type:</p>`;
        data.byType.forEach(item => {
          html += `<div class="row"><span>${item._id}</span><span>${formatCurrency(item.total)} (${item.count})</span></div>`;
        });
        html += `</div>`;
      }
    }

    // Inventory Report
    if (activeReport === 'inventory' && data.summary) {
      html += `
        <div class="row"><span>Total Items</span><span>${data.summary?.totalItems || 0}</span></div>
        <div class="row"><span>Total Stock Value</span><span>${formatCurrency(data.summary?.totalValue || 0)}</span></div>
        <div class="row total"><span>Total Value</span><span>${formatCurrency(data.summary?.totalValue || 0)}</span></div>
      `;
      if (data.lowStock?.length) {
        html += `<div style="margin-top:8px;color:#dc2626;"><p style="font-weight:600;font-size:10px;margin:4px 0;">⚠️ Low Stock Items:</p>`;
        data.lowStock.forEach(item => {
          html += `<div class="row"><span>${item.name}</span><span>${item.stock} ${item.unit}</span></div>`;
        });
        html += `</div>`;
      }
    }

    // Payroll Report
    if (activeReport === 'payroll' && data.summary) {
      html += `
        <div class="row"><span>Total Payroll</span><span>${formatCurrency(data.summary?.totalPay || 0)}</span></div>
        <div class="row"><span>Total Employees</span><span>${data.summary?.totalEmployees || 0}</span></div>
        <div class="row"><span>Average Pay</span><span>${formatCurrency(data.summary?.averagePay || 0)}</span></div>
        <div class="row total"><span>Total Payroll</span><span>${formatCurrency(data.summary?.totalPay || 0)}</span></div>
      `;
    }

    return html;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <Button variant="secondary" onClick={handlePrint} disabled={!reportData}>
          <Printer size={16} /> Print
        </Button>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.key}
              className={`cursor-pointer transition-all hover:shadow-md text-center ${
                activeReport === type.key
                  ? 'border-2 border-primary-500 dark:border-primary-400'
                  : ''
              }`}
              onClick={() => {
                setActiveReport(type.key);
                setReportData(null);
              }}
            >
              <Icon
                size={24}
                className={`mx-auto mb-1 ${
                  activeReport === type.key
                    ? `text-${type.color}-500`
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  activeReport === type.key
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {type.label}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Date Range / Period Selector */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          {activeReport !== 'inventory' && activeReport !== 'payroll' && (
            <>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </>
          )}

          {activeReport === 'payroll' && (
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period (YYYY-MM)</label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          )}

          <Button onClick={fetchReport} loading={loading} className="shrink-0">
            <Calendar size={16} /> Generate Report
          </Button>
        </div>
      </Card>

      {/* Report Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : reportData ? (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <FileText size={20} className="text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {activeReport.toUpperCase()} Report
              </h3>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeReport === 'general' && reportData.revenue && (
                <>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.revenue?.total || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Expenses</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(reportData.expenses?.total || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Profit</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency((reportData.revenue?.total || 0) - (reportData.expenses?.total || 0))}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-xl font-bold text-purple-600">{reportData.revenue?.count || 0}</p>
                  </div>
                </>
              )}

              {activeReport === 'sales' && reportData.summary && (
                <>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.summary?.totalRevenue || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-xl font-bold text-blue-600">{reportData.summary?.totalOrders || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Average</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(reportData.summary?.averageOrder || 0)}</p>
                  </div>
                </>
              )}

              {activeReport === 'expenses' && reportData.summary && (
                <>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(reportData.summary?.totalAmount || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Transactions</p>
                    <p className="text-xl font-bold text-blue-600">{reportData.summary?.totalExpenses || 0}</p>
                  </div>
                </>
              )}

              {activeReport === 'inventory' && reportData.summary && (
                <>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-xl font-bold text-blue-600">{reportData.summary?.totalItems || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Total Value</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.summary?.totalValue || 0)}</p>
                  </div>
                  {reportData.lowStock?.length > 0 && (
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-xs text-gray-500">Low Stock</p>
                      <p className="text-xl font-bold text-red-600">{reportData.lowStock.length}</p>
                    </div>
                  )}
                </>
              )}

              {activeReport === 'payroll' && reportData.summary && (
                <>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Total Payroll</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(reportData.summary?.totalPay || 0)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-gray-500">Employees</p>
                    <p className="text-xl font-bold text-blue-600">{reportData.summary?.totalEmployees || 0}</p>
                  </div>
                </>
              )}
            </div>

            {/* Details Table */}
            {reportData.daily && reportData.daily.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Daily Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Count</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.daily.map((day, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2">{day._id}</td>
                          <td className="px-3 py-2 text-right">{day.count || 0}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(day.amount || day.revenue || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* By Type / Category */}
            {reportData.byType && reportData.byType.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">By Type</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Type</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Count</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byType.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2">{item._id}</td>
                          <td className="px-3 py-2 text-right">{item.count || 0}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(item.total || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {reportData.byPaymentMethod && reportData.byPaymentMethod.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">By Payment Method</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Method</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Count</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.byPaymentMethod.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2">{item._id}</td>
                          <td className="px-3 py-2 text-right">{item.count || 0}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(item.total || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Low Stock Items */}
            {reportData.lowStock && reportData.lowStock.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-red-600">⚠️ Low Stock Items</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-red-50 dark:bg-red-900/20">
                        <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400">Item</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Stock</th>
                        <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.lowStock.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2">{item.name}</td>
                          <td className="px-3 py-2 text-right text-red-600 font-medium">{item.stock}</td>
                          <td className="px-3 py-2 text-right">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-20">
          <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Report Generated</h3>
          <p className="text-sm text-gray-500 mt-1">
            Select report type and date range, then click "Generate Report"
          </p>
        </Card>
      )}
    </div>
  );
}