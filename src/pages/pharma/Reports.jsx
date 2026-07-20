import { useState, useEffect, useCallback } from 'react';
import { getInventoryReport, getExpiryReport, getPLReport } from '../../api/pharma/reports';
import { getSales } from '../../api/pharma/sales';
import { getSuppliers } from '../../api/pharma/suppliers';
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
  { key: 'inventory', label: 'Inventory' },
  { key: 'sales', label: 'Sales' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'profit-loss', label: 'P&L' },
];

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(false);
  const [inventoryData, setInventoryData] = useState({ medicines: [], expiring: [], totalCost: 0, totalRetail: 0 });
  const [salesData, setSalesData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [plData, setPlData] = useState({ revenue: 0, cost: 0, profit: 0, sales: 0 });
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const businessName = user?.businessName || 'Pharmacy';

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, expRes] = await Promise.all([getInventoryReport(), getExpiryReport()]);
      const inv = invRes?.data || invRes || {};
      const exp = expRes?.data || expRes || [];
      setInventoryData({ medicines: inv.medicines || [], expiring: exp, totalCost: inv.totalCost || 0, totalRetail: inv.totalRetail || 0 });
    } catch (err) { console.error('Inventory fetch error:', err); }
    setLoading(false);
  }, []);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSales({ startDate, endDate, paymentStatus: 'paid', limit: 500 });
      setSalesData(res?.data || []);
    } catch (err) { console.error('Sales fetch error:', err); }
    setLoading(false);
  }, [startDate, endDate]);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSuppliers();
      setSupplierData(res?.data || []);
    } catch (err) { console.error('Suppliers fetch error:', err); }
    setLoading(false);
  }, []);

  const fetchPL = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPLReport({ startDate, endDate });
      const data = res?.data || res || {};
      setPlData({ revenue: data.revenue || 0, cost: data.cost || 0, profit: data.profit || 0, sales: data.sales || 0 });
    } catch (err) { console.error('PL fetch error:', err); }
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    if (activeTab === 'inventory') fetchInventory();
    if (activeTab === 'sales') fetchSales();
    if (activeTab === 'suppliers') fetchSuppliers();
    if (activeTab === 'profit-loss') fetchPL();
  }, [activeTab, fetchInventory, fetchSales, fetchSuppliers, fetchPL]);

  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    const reportDate = `${formatDate(startDate)} — ${formatDate(endDate)}`;
    let title = '';
    let body = '';

    if (activeTab === 'inventory') {
      const meds = inventoryData.medicines || [];
      title = 'Inventory Report';
      body = `
        <div class="summary">
          <div class="summary-row"><span>Total Items:</span><span>${meds.length}</span></div>
          <div class="summary-row"><span>Low Stock:</span><span>${meds.filter(m=>m.stock<=m.minStockAlert).length}</span></div>
          <div class="summary-row"><span>Expiring Soon:</span><span>${(inventoryData.expiring||[]).length}</span></div>
          <div class="summary-row"><span>Cost Value:</span><span>${formatCurrency(inventoryData.totalCost||0)}</span></div>
          <div class="summary-row"><span>Retail Value:</span><span>${formatCurrency(inventoryData.totalRetail||0)}</span></div>
          <div class="summary-row total-row"><span>Potential Profit:</span><span style="color:#16a34a;">${formatCurrency((inventoryData.totalRetail||0)-(inventoryData.totalCost||0))}</span></div>
        </div>
        <table><thead><tr><th>Medicine</th><th>Batch</th><th>Stock</th><th>Cost</th><th>Retail</th><th>Value</th><th>Expiry</th></tr></thead><tbody>
        ${meds.map(m=>`<tr><td>${m.name}${m.dosage?' '+m.dosage:''}</td><td>${m.batchNo||'—'}</td><td>${m.stock}</td><td>${formatCurrency(m.buyingPrice)}</td><td>${formatCurrency(m.sellingPrice)}</td><td>${formatCurrency(m.sellingPrice*m.stock)}</td><td>${m.expiryDate?formatDate(m.expiryDate):'—'}</td></tr>`).join('')}
        </tbody></table>`;
    }

    if (activeTab === 'sales') {
      const total = salesData.reduce((s,r)=>s+(r.totalAmount||0),0);
      title = 'Sales Report';
      body = `
        <div class="summary">
          <div class="summary-row"><span>Transactions:</span><span>${salesData.length}</span></div>
          <div class="summary-row"><span>Revenue:</span><span style="color:#16a34a;">${formatCurrency(total)}</span></div>
          <div class="summary-row total-row"><span>Avg Sale:</span><span>${formatCurrency(salesData.length>0?total/salesData.length:0)}</span></div>
        </div>
        <table><thead><tr><th>Receipt</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Date</th></tr></thead><tbody>
        ${salesData.map(s=>`<tr><td>${s.receiptNumber}</td><td>${s.customerName}</td><td>${s.items?.length||0}</td><td class="right bold">${formatCurrency(s.totalAmount)}</td><td class="capitalize">${s.paymentMethod}</td><td>${formatDate(s.createdAt)}</td></tr>`).join('')}
        </tbody></table>`;
    }

    if (activeTab === 'suppliers') {
      title = 'Supplier Report';
      body = `
        <div class="summary"><div class="summary-row"><span>Total Suppliers:</span><span>${supplierData.length}</span></div></div>
        <table><thead><tr><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th>Address</th></tr></thead><tbody>
        ${supplierData.map(s=>`<tr><td>${s.name}</td><td>${s.company||'—'}</td><td>${s.phone}</td><td>${s.email||'—'}</td><td>${s.address||'—'}</td></tr>`).join('')}
        </tbody></table>`;
    }

    if (activeTab === 'profit-loss') {
      title = 'Profit & Loss Statement';
      body = `
        <div class="summary">
          <div class="summary-row"><span>Revenue (${plData.sales} sales):</span><span style="color:#16a34a;">${formatCurrency(plData.revenue)}</span></div>
          <div class="summary-row"><span>Cost of Goods Sold:</span><span style="color:#e11d48;">(${formatCurrency(plData.cost)})</span></div>
          <div class="summary-row total-row"><span>Net Profit:</span><span style="color:${plData.profit>=0?'#16a34a':'#e11d48'};">${formatCurrency(plData.profit)}</span></div>
          <div class="summary-row"><span>Margin:</span><span>${plData.revenue>0?((plData.profit/plData.revenue)*100).toFixed(1):0}%</span></div>
        </div>`;
    }

    const html = `<!DOCTYPE html><html><head><title>${title}</title>
<style>@page{size:A4;margin:12mm;}*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#1e293b;}.header{text-align:center;margin-bottom:14px;border-bottom:2px solid #059669;padding-bottom:10px;}.header h2{margin:0 0 2px;font-size:18px;color:#059669;}.header .sub{font-size:9px;color:#64748b;}.meta{display:flex;justify-content:space-between;margin-bottom:10px;font-size:9px;color:#64748b;}.summary{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;margin-bottom:12px;}.summary-row{display:flex;justify-content:space-between;padding:3px 0;font-size:10px;border-bottom:1px dotted #d1fae5;}.summary-row:last-child{border-bottom:0;}.total-row{font-weight:700;font-size:12px;border-top:1px solid #059669;margin-top:4px;padding-top:6px;}table{width:100%;border-collapse:collapse;margin-bottom:10px;}th{text-align:left;padding:5px 6px;border-bottom:2px solid #059669;font-size:9px;color:#059669;background:#f0fdf4;font-weight:600;}td{padding:4px 6px;border-bottom:1px solid #e2e8f0;font-size:9px;}.right{text-align:right;}.bold{font-weight:600;}.capitalize{text-transform:capitalize;}.footer{text-align:center;margin-top:16px;font-size:8px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px;}</style></head><body>
<div class="header"><h2>${businessName}</h2><div class="sub">${title}</div></div>
<div class="meta"><span>Period: ${reportDate}</span><span>Printed: ${now}</span></div>
${body}
<div class="footer">Generated by PharmaSys &mdash; ${now}</div>
</body></html>`;
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
      {activeTab !== 'suppliers' && (
        <div className="flex gap-3 items-end">
          <Input label="From" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="To" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      )}
      {loading ? <Spinner /> : (
        <>
          {activeTab === 'inventory' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="text-center"><p className="text-3xl font-extrabold text-primary-600">{inventoryData.medicines?.length||0}</p><p className="text-xs text-gray-500 mt-1">Items</p></Card>
                <Card className="text-center"><p className="text-3xl font-extrabold text-yellow-500">{inventoryData.medicines?.filter(m=>m.stock<=m.minStockAlert).length||0}</p><p className="text-xs text-gray-500 mt-1">Low Stock</p></Card>
                <Card className="text-center"><p className="text-3xl font-extrabold text-red-500">{inventoryData.expiring?.length||0}</p><p className="text-xs text-gray-500 mt-1">Expiring</p></Card>
                <Card className="text-center"><p className="text-3xl font-extrabold text-green-500">{formatCurrency(inventoryData.totalRetail||0)}</p><p className="text-xs text-gray-500 mt-1">Stock Value</p></Card>
              </div>
              <Table columns={[
                { key: 'name', label: 'Medicine' },{ key: 'batchNo', label: 'Batch' },
                { key: 'stock', label: 'Stock', render: r=><Badge color={r.stock<=r.minStockAlert?'red':'green'}>{r.stock}</Badge> },
                { key: 'buyingPrice', label: 'Cost', render: r=>formatCurrency(r.buyingPrice) },
                { key: 'sellingPrice', label: 'Retail', render: r=>formatCurrency(r.sellingPrice) },
                { key: 'value', label: 'Value', render: r=>formatCurrency(r.sellingPrice*r.stock) },
                { key: 'expiryDate', label: 'Expiry', render: r=>r.expiryDate?formatDate(r.expiryDate):'—' },
              ]} data={inventoryData.medicines||[]} />
            </div>
          )}
          {activeTab === 'sales' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="text-center"><p className="text-3xl font-extrabold text-primary-600">{salesData.length}</p><p className="text-xs text-gray-500 mt-1">Transactions</p></Card>
                <Card className="text-center"><p className="text-3xl font-extrabold text-green-500">{formatCurrency(salesData.reduce((s,r)=>s+(r.totalAmount||0),0))}</p><p className="text-xs text-gray-500 mt-1">Revenue</p></Card>
                <Card className="text-center"><p className="text-3xl font-extrabold text-gray-600">{formatCurrency(salesData.length>0?salesData.reduce((s,r)=>s+(r.totalAmount||0),0)/salesData.length:0)}</p><p className="text-xs text-gray-500 mt-1">Avg</p></Card>
              </div>
              <Table columns={[
                { key: 'receiptNumber', label: 'Receipt' },{ key: 'customerName', label: 'Customer' },
                { key: 'items', label: 'Items', render: r=>r.items?.length||0 },
                { key: 'totalAmount', label: 'Total', render: r=>formatCurrency(r.totalAmount) },
                { key: 'paymentMethod', label: 'Payment', render: r=><span className="capitalize">{r.paymentMethod}</span> },
                { key: 'createdAt', label: 'Date', render: r=>formatDate(r.createdAt) },
              ]} data={salesData} />
            </div>
          )}
          {activeTab === 'suppliers' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Total: <strong>{supplierData.length}</strong></p>
              <Table columns={[
                { key: 'name', label: 'Name' },{ key: 'company', label: 'Company' },
                { key: 'phone', label: 'Phone' },{ key: 'email', label: 'Email' },{ key: 'address', label: 'Address' },
              ]} data={supplierData} />
            </div>
          )}
          {activeTab === 'profit-loss' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Card className="text-center"><p className="text-sm text-gray-500">Revenue</p><p className="text-3xl font-extrabold text-green-500">{formatCurrency(plData.revenue)}</p></Card>
                <Card className="text-center"><p className="text-sm text-gray-500">Cost</p><p className="text-3xl font-extrabold text-red-500">{formatCurrency(plData.cost)}</p></Card>
                <Card className="text-center"><p className="text-sm text-gray-500">Profit</p><p className={`text-3xl font-extrabold ${plData.profit>=0?'text-green-600':'text-red-600'}`}>{formatCurrency(plData.profit)}</p></Card>
              </div>
              <Card>
                <h3 className="font-semibold mb-4">Profit & Loss Statement</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Revenue ({plData.sales} sales)</span><span className="text-green-600">{formatCurrency(plData.revenue)}</span></div>
                  <div className="flex justify-between"><span>Cost of Goods Sold</span><span className="text-red-500">({formatCurrency(plData.cost)})</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Net Profit</span><span className={plData.profit>=0?'text-green-600':'text-red-600'}>{formatCurrency(plData.profit)}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Margin</span><span>{plData.revenue>0?((plData.profit/plData.revenue)*100).toFixed(1):0}%</span></div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}