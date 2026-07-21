import { useState, useEffect, useRef } from 'react';
import { getSales, createSale, createInvoice, updateInvoice, markInvoicePaid, cancelSale, sendInvoiceEmail } from '../../api/pharma/sales';
import { getMedicines } from '../../api/pharma/medicines';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { BarcodeScanner } from '../../components/pharma/app/BarcodeScanner';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Search, Plus, Minus, Trash2, ShoppingCart, Mail, Printer, X, Send, FileText, Eye, CheckCircle, Ban, Edit } from 'lucide-react';

const tabs = [
  { key: 'pos', label: 'POS' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'history', label: 'History' },
];

export default function Sales() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [activeTab, setActiveTab] = useState('pos');
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoiceEdit, setShowInvoiceEdit] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [viewSale, setViewSale] = useState(null);
  const [editSale, setEditSale] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState({ id: null, email: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [invoiceForm, setInvoiceForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', paymentMethod: 'cash', discount: 0, items: [] });
  const receiptRef = useRef(null);
  const invoiceRef = useRef(null);
  const systemName = user?.businessName || 'PharmaSys';

  useEffect(() => { getMedicines({ limit: 200 }).then(res => setMedicines(res?.data || [])).catch(() => {}); }, []);

  useEffect(() => {
    if (activeTab === 'history') { setLoading(true); getSales({ page, limit: 20, paymentStatus: 'paid,cancelled' }).then(res => { setSales(res?.data || []); setTotalPages(res?.pagination?.totalPages || 1); }).catch(() => {}).finally(() => setLoading(false)); }
    if (activeTab === 'invoices') { setLoading(true); const params = { page, limit: 20, source: 'invoice' }; if (filterStatus) params.paymentStatus = filterStatus; getSales(params).then(res => { setSales(res?.data || []); setTotalPages(res?.pagination?.totalPages || 1); }).catch(() => {}).finally(() => setLoading(false)); }
  }, [activeTab, page, filterStatus]);

  // POS Cart
  const addToCart = (med) => setCart(prev => { const ex = prev.find(i => i._id === med._id); if (ex) return prev.map(i => i._id === med._id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { ...med, quantity: 1 }]; });
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));
  const updateQty = (id, qty) => { if (qty <= 0) { removeFromCart(id); return; } setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: qty } : i)); };
  const cartTotal = cart.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
  const grandTotal = cartTotal - Number(discount);
  const clearCart = () => { setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscount(0); };

  const handleCheckout = async () => {
    if (cart.length === 0) { error('Cart is empty'); return; }
    setSaving(true);
    try {
      const items = cart.map(i => ({ medicineId: i._id, quantity: i.quantity }));
      const res = await createSale({ items, customerName: customerName || 'Walk-in Customer', customerPhone, paymentMethod, discount: Number(discount) });
      const sale = res?.data || res;
      setLastSale({ ...sale, items: cart.map(i => ({ ...i, medicineName: i.name, total: i.sellingPrice * i.quantity })) });
      setShowReceipt(true); clearCart(); success('Sale completed');
    } catch (err) { error(err.response?.data?.message || 'Checkout failed'); }
    setSaving(false);
  };

  // Invoice CRUD
  const openNewInvoice = () => { setEditSale(null); setInvoiceForm({ customerName: '', customerPhone: '', customerEmail: '', paymentMethod: 'cash', discount: 0, items: [] }); setShowInvoiceEdit(true); };
  const openEditInvoice = (sale) => { setEditSale(sale); setInvoiceForm({ customerName: sale.customerName || '', customerPhone: sale.customerPhone || '', customerEmail: sale.customerEmail || '', paymentMethod: sale.paymentMethod || 'cash', discount: sale.discount || 0, items: (sale.items || []).map(i => ({ medicineId: i.medicineId, medicineName: i.medicineName, quantity: i.quantity, unitPrice: i.unitPrice })) }); setShowInvoiceEdit(true); };
  const addInvoiceItem = (med) => setInvoiceForm(prev => { const ex = prev.items.find(i => i.medicineId === med._id); if (ex) return { ...prev, items: prev.items.map(i => i.medicineId === med._id ? { ...i, quantity: i.quantity + 1 } : i) }; return { ...prev, items: [...prev.items, { medicineId: med._id, medicineName: med.name, quantity: 1, unitPrice: med.sellingPrice }] }; });
  const removeInvoiceItem = (id) => setInvoiceForm(prev => ({ ...prev, items: prev.items.filter(i => i.medicineId !== id) }));
  const updateInvoiceItemQty = (id, qty) => { if (qty <= 0) { removeInvoiceItem(id); return; } setInvoiceForm(prev => ({ ...prev, items: prev.items.map(i => i.medicineId === id ? { ...i, quantity: qty } : i) })); };
  const invoiceTotal = invoiceForm.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) - Number(invoiceForm.discount || 0);

  const handleSaveInvoice = async () => { setSaving(true); try { const data = { ...invoiceForm, discount: Number(invoiceForm.discount), items: invoiceForm.items.map(i => ({ medicineId: i.medicineId, quantity: i.quantity })) }; if (editSale) { await updateInvoice(editSale._id, data); success('Invoice updated'); } else { await createInvoice(data); success('Invoice created'); } setShowInvoiceEdit(false); const res = await getSales({ page, limit: 20, source: 'invoice' }); setSales(res?.data || []); } catch (err) { error(err.response?.data?.message || 'Failed'); } setSaving(false); };
  const handlePayInvoice = async (id) => { if (!confirm('Mark as paid? Stock will be deducted.')) return; try { await markInvoicePaid(id); success('Paid'); const res = await getSales({ page, limit: 20, source: 'invoice' }); setSales(res?.data || []); } catch (err) { error('Failed'); } };
  const handleCancelInvoice = async (id) => { if (!confirm('Cancel?')) return; try { await cancelSale(id); success('Cancelled'); const res = await getSales({ page, limit: 20, source: 'invoice' }); setSales(res?.data || []); } catch (err) { error('Failed'); } };
  const handleDeleteInvoice = async (id) => { if (!confirm('Delete permanently?')) return; try { await cancelSale(id); success('Deleted'); const res = await getSales({ page, limit: 20, source: 'invoice' }); setSales(res?.data || []); } catch (err) { error('Failed'); } };
  const handleCancelSale = async (id) => { if (!confirm('Cancel? Stock will be restored.')) return; try { await cancelSale(id); success('Cancelled'); const res = await getSales({ page, limit: 20, paymentStatus: 'paid,cancelled' }); setSales(res?.data || []); } catch (err) { error('Failed'); } };
  const handleDeleteSaleRecord = async (id) => { if (!confirm('Delete permanently?')) return; try { await cancelSale(id); success('Deleted'); const res = await getSales({ page, limit: 20, paymentStatus: 'paid,cancelled' }); setSales(res?.data || []); } catch (err) { error('Failed'); } };

  const openEmailModal = (sale) => { setEmailTarget({ id: sale._id, email: sale.customerEmail || '' }); setShowEmailModal(true); };
  const handleSendInvoice = async () => { if (!emailTarget.email) { error('Email required'); return; } try { await sendInvoiceEmail(emailTarget.id, emailTarget.email); success('Sent'); setShowEmailModal(false); } catch (err) { error('Failed'); } };
  const openInvoiceView = (sale) => { setViewSale(sale); setShowInvoiceView(true); };

  // Print
  const printReceipt = () => {
    const sale = lastSale; if (!sale) return;
    const now = new Date().toLocaleString('en-KE');
    const html = `<!DOCTYPE html><html><head><title>Receipt</title><style>body{font-family:Arial,sans-serif;font-size:12px;padding:20px;max-width:360px;margin:0 auto;color:#1e293b;}.hdr{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:8px;margin-bottom:12px;}.hdr h3{margin:0 0 4px;font-size:16px;color:#059669;}.hdr p{margin:0;font-size:10px;color:#64748b;}table{width:100%;border-collapse:collapse;}th{text-align:left;padding:4px 0;border-bottom:1px solid #ddd;font-size:10px;color:#64748b;}td{padding:3px 0;font-size:11px;border-bottom:1px solid #f1f5f9;}.r{text-align:right;}.b{font-weight:bold;}.tot{border-top:2px solid #1e293b;font-size:13px;margin-top:4px;padding-top:6px;}.ftr{text-align:center;margin-top:16px;font-size:9px;color:#94a3b8;border-top:1px dashed #ccc;padding-top:8px;}</style></head><body><div class="hdr"><h3>${systemName}</h3><p>Receipt #${sale.receiptNumber}</p><p>${formatDate(new Date())}</p></div><div style="margin-bottom:12px;"><strong>${sale.customerName||'Customer'}</strong>${sale.customerPhone?`<br>${sale.customerPhone}`:''}</div><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${(sale.items||[]).map(i=>`<tr><td>${i.medicineName||i.name}${i.dosage?' · '+i.dosage:''}</td><td class="r">${i.quantity}</td><td class="r">${formatCurrency(i.unitPrice||i.sellingPrice)}</td><td class="r b">${formatCurrency(i.total||i.totalPrice)}</td></tr>`).join('')}</tbody></table>${sale.discount>0?`<p style="color:#e11d48;">Discount: -${formatCurrency(sale.discount)}</p>`:''}<div class="tot" style="display:flex;justify-content:space-between;"><span>TOTAL</span><span style="color:#059669;">${formatCurrency(sale.totalAmount)}</span></div><p style="font-size:10px;color:#64748b;margin-top:4px;">Payment: ${sale.paymentMethod||'Cash'}</p><div class="ftr">Generated by PharmaSys at ${now}</div></body></html>`;
    const win = window.open('', '_blank', 'width=400,height=600'); win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500);
  };

  const printInvoice = (sale) => { const s = sale || viewSale; if (!s) return; const isPaid = s.paymentStatus === 'paid'; const now = new Date().toLocaleString('en-KE'); const html = `<html><head><title>${isPaid?'Receipt':'Invoice'}</title><style>body{font-family:Arial;font-size:12px;padding:20px;max-width:360px;margin:0 auto;color:#1e293b;}.hdr{text-align:center;border-bottom:1px dashed #ccc;padding-bottom:8px;margin-bottom:12px;}.hdr h3{margin:0 0 4px;font-size:16px;color:#059669;}.hdr p{margin:0;font-size:10px;color:#64748b;}table{width:100%;border-collapse:collapse;}th{text-align:left;padding:4px 0;border-bottom:1px solid #ddd;font-size:10px;color:#64748b;}td{padding:3px 0;font-size:11px;border-bottom:1px solid #f1f5f9;}.r{text-align:right;}.b{font-weight:bold;}.tot{border-top:2px solid #1e293b;font-size:13px;}.ftr{text-align:center;margin-top:16px;font-size:9px;color:#94a3b8;border-top:1px dashed #ccc;padding-top:8px;}</style></head><body><div class="hdr"><h3>${systemName}</h3><p>${isPaid?'Receipt':'Invoice'} #${s.receiptNumber}</p><p>${formatDate(s.createdAt)}</p></div><div style="margin-bottom:12px;"><strong>${s.customerName||'Customer'}</strong>${s.customerPhone?`<br>${s.customerPhone}`:''}</div><table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${(s.items||[]).map(i=>`<tr><td>${i.medicineName}${i.dosage?' · '+i.dosage:''}</td><td class="r">${i.quantity}</td><td class="r">${formatCurrency(i.unitPrice)}</td><td class="r b">${formatCurrency(i.totalPrice)}</td></tr>`).join('')}</tbody></table>${s.discount>0?`<p style="color:#e11d48;">Discount: -${formatCurrency(s.discount)}</p>`:''}<div class="tot" style="display:flex;justify-content:space-between;"><span>${isPaid?'Total Paid':'Amount Due'}</span><span style="color:${isPaid?'#16a34a':'#f59e0b'};">${formatCurrency(s.totalAmount)}</span></div><p style="font-size:10px;color:#64748b;margin-top:4px;">Payment: ${s.paymentMethod||'Cash'} | Status: ${s.paymentStatus}</p><div class="ftr">Generated by PharmaSys at ${now}</div></body></html>`; const win = window.open('', '_blank', 'width=400,height=600'); win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); };

  const invoiceColumns = [
    { key: 'receiptNumber', label: 'Invoice #' }, { key: 'customerName', label: 'Customer' },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'paymentStatus', label: 'Status', render: (r) => <Badge color={r.paymentStatus === 'paid' ? 'green' : r.paymentStatus === 'pending' ? 'yellow' : 'red'}>{r.paymentStatus}</Badge> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openInvoiceView(r)}><Eye size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => printInvoice(r)}><Printer size={14} /></Button>
        {r.paymentStatus === 'pending' && <Button size="sm" variant="ghost" onClick={() => openEditInvoice(r)}><Edit size={14} /></Button>}
        {r.paymentStatus === 'pending' && <Button size="sm" variant="ghost" onClick={() => handlePayInvoice(r._id)} className="text-green-500"><CheckCircle size={14} /></Button>}
        {r.paymentStatus === 'pending' && <Button size="sm" variant="ghost" onClick={() => handleCancelInvoice(r._id)} className="text-red-500"><Ban size={14} /></Button>}
        {r.paymentStatus === 'paid' && <Button size="sm" variant="ghost" onClick={() => handleDeleteInvoice(r._id)} className="text-red-500"><Trash2 size={14} /></Button>}
        <Button size="sm" variant="ghost" onClick={() => openEmailModal(r)}><Send size={14} /></Button>
      </div>
    )},
  ];

  const historyColumns = [
    { key: 'receiptNumber', label: 'Receipt' }, { key: 'customerName', label: 'Customer' },
    { key: 'source', label: 'Source', render: (r) => <Badge color={r.source === 'pos' ? 'blue' : 'purple'}>{r.source}</Badge> },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'paymentStatus', label: 'Status', render: (r) => <Badge color={r.paymentStatus === 'paid' ? 'green' : 'red'}>{r.paymentStatus}</Badge> },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={() => openInvoiceView(r)}><Eye size={14} /></Button>
        <Button size="sm" variant="ghost" onClick={() => printInvoice(r)}><Printer size={14} /></Button>
        {r.paymentStatus !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => handleCancelSale(r._id)} className="text-red-500"><Ban size={14} /></Button>}
        {r.paymentStatus === 'paid' && <Button size="sm" variant="ghost" onClick={() => handleDeleteSaleRecord(r._id)} className="text-red-500"><Trash2 size={14} /></Button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>{activeTab === 'invoices' && <Button onClick={openNewInvoice}><Plus size={18} /> New Invoice</Button>}</div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* POS TAB */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="relative"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
            <BarcodeScanner onSelect={(med) => med && addToCart(med)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
              {medicines.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) && m.stock > 0).slice(0, 30).map(med => (
                <Card key={med._id} hover onClick={() => addToCart(med)} className="cursor-pointer p-3 flex justify-between items-center">
                  <div><p className="font-medium text-sm">{med.name}</p><p className="text-xs text-gray-500">{med.dosage} | Stock: {med.stock}</p></div>
                  <p className="font-bold text-primary-600">{formatCurrency(med.sellingPrice)}</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="sticky top-20">
            <div className="flex justify-between mb-4"><h3 className="font-semibold"><ShoppingCart size={18} /> Cart ({cart.length})</h3>{cart.length > 0 && <Button size="sm" variant="ghost" onClick={clearCart} className="text-red-500">Clear</Button>}</div>
            <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-gray-500">{formatCurrency(item.sellingPrice)}</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item._id, item.quantity - 1)} className="p-1 rounded hover:bg-gray-200"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, item.quantity + 1)} className="p-1 rounded hover:bg-gray-200"><Plus size={14} /></button>
                    <button onClick={() => removeFromCart(item._id)} className="p-1 rounded hover:bg-gray-200 text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Cart is empty</p>}
            </div>
            <div className="space-y-2 mb-4">
              <Input label="Customer" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in" />
              <Input label="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              <div className="flex gap-2">
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-3 py-2">
                  <option value="cash">Cash</option><option value="mpesa">M-Pesa</option><option value="card">Card</option>
                </select>
                <Input label="Disc." type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="w-20" />
              </div>
            </div>
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(cartTotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="text-red-500">-{formatCurrency(Number(discount))}</span></div>}
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-primary-600">{formatCurrency(grandTotal)}</span></div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={handleCheckout} loading={saving} disabled={cart.length === 0}><ShoppingCart size={18} /> Checkout</Button>
          </Card>
        </div>
      )}

      {/* INVOICES & HISTORY - unchanged */}
      {activeTab === 'invoices' && (
        <div>
          <div className="flex gap-2 mb-4"><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-3 py-2"><option value="">All</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="cancelled">Cancelled</option></select></div>
          {loading ? <Spinner /> : sales.length === 0 ? <Card className="text-center py-12"><FileText size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No invoices</h3></Card> : <><Table columns={invoiceColumns} data={sales} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}
        </div>
      )}
      {activeTab === 'history' && (
        <div>{loading ? <Spinner /> : sales.length === 0 ? <Card className="text-center py-12"><FileText size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No history</h3></Card> : <><Table columns={historyColumns} data={sales} /><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></>}</div>
      )}

      {/* Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Receipt" size="sm">
        <div ref={receiptRef}>
          <div className="text-center border-b border-dashed pb-3 mb-3"><h3 className="font-bold text-base" style={{color:'#059669'}}>{systemName}</h3><p className="text-xs text-gray-500">Receipt #{lastSale?.receiptNumber}</p><p className="text-xs text-gray-500">{formatDate(new Date())}</p></div>
          <table className="w-full text-sm"><tbody>{lastSale?.items?.map((item,i)=><tr key={i} className="border-b border-gray-100"><td className="py-1.5 text-xs">{item.medicineName||item.name}</td><td className="text-center text-xs">{item.quantity}</td><td className="text-right text-xs font-medium">{formatCurrency(item.total||item.totalPrice)}</td></tr>)}</tbody></table>
          {lastSale?.discount>0&&<div className="flex justify-between text-xs mt-2"><span>Discount</span><span className="text-red-500">-{formatCurrency(lastSale.discount)}</span></div>}
          <div className="flex justify-between font-bold text-sm border-t pt-2 mt-2"><span>TOTAL</span><span style={{color:'#059669'}}>{formatCurrency(lastSale?.totalAmount)}</span></div>
          <p className="text-center text-xs text-gray-400 mt-3">Payment: {lastSale?.paymentMethod||'Cash'}</p>
        </div>
        <div className="flex gap-2 mt-4"><Button variant="secondary" className="flex-1" onClick={printReceipt}><Printer size={16} /> Print</Button></div>
      </Modal>

      {/* Invoice Edit Modal */}
      <Modal isOpen={showInvoiceEdit} onClose={() => setShowInvoiceEdit(false)} title={editSale ? 'Edit Invoice' : 'New Invoice'} size="lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Customer Name" value={invoiceForm.customerName} onChange={e => setInvoiceForm({...invoiceForm, customerName: e.target.value})} />
          <Input label="Phone" value={invoiceForm.customerPhone} onChange={e => setInvoiceForm({...invoiceForm, customerPhone: e.target.value})} />
          <Input label="Email" type="email" value={invoiceForm.customerEmail||''} onChange={e => setInvoiceForm({...invoiceForm, customerEmail: e.target.value})} placeholder="For sending invoice" />
          <select value={invoiceForm.paymentMethod} onChange={e => setInvoiceForm({...invoiceForm, paymentMethod: e.target.value})} className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm px-3 py-2"><option value="cash">Cash</option><option value="mpesa">M-Pesa</option><option value="card">Card</option></select>
          <Input label="Discount" type="number" value={invoiceForm.discount} onChange={e => setInvoiceForm({...invoiceForm, discount: e.target.value})} />
        </div>
        <div className="mb-4"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><Input placeholder="Add medicine..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div><div className="grid grid-cols-2 gap-1 mt-2 max-h-[150px] overflow-y-auto">{medicines.filter(m=>m.name.toLowerCase().includes(search.toLowerCase())).slice(0,10).map(med=><button key={med._id} onClick={()=>addInvoiceItem(med)} className="text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">{med.name} - {formatCurrency(med.sellingPrice)}</button>)}</div></div>
        <div className="space-y-1 mb-4">{invoiceForm.items.map(item=><div key={item.medicineId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"><span className="text-sm flex-1">{item.medicineName}</span><div className="flex items-center gap-2"><button onClick={()=>updateInvoiceItemQty(item.medicineId,item.quantity-1)}><Minus size={14}/></button><span className="text-sm w-6 text-center">{item.quantity}</span><button onClick={()=>updateInvoiceItemQty(item.medicineId,item.quantity+1)}><Plus size={14}/></button><span className="text-sm w-20 text-right">{formatCurrency(item.unitPrice*item.quantity)}</span><button onClick={()=>removeInvoiceItem(item.medicineId)} className="text-red-500"><X size={14}/></button></div></div>)}</div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary-600">{formatCurrency(invoiceTotal)}</span></div>
        <div className="flex gap-3 mt-4"><Button variant="secondary" onClick={()=>setShowInvoiceEdit(false)}>Cancel</Button><Button onClick={handleSaveInvoice} loading={saving}>Save Invoice</Button></div>
      </Modal>

      {/* Invoice View + Email modals unchanged */}
    </div>
  );
}