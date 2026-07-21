import { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../api/pharma/suppliers';
import { getPurchases, createPurchase, sendToSupplier, receiveOrder } from '../../api/pharma/purchases';
import { getMedicines } from '../../api/pharma/medicines';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Table } from '../../components/ui/Table';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { formatCurrency, formatDate } from '../../utils/format';
import { Plus, Edit, Trash2, Truck, Send, Package, X, Minus, Plus as PlusIcon, Search } from 'lucide-react';

const tabs = [
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'orders', label: 'Purchase Orders' },
];

export default function Suppliers() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [receivingOrder, setReceivingOrder] = useState(null);
  const [supplierForm, setSupplierForm] = useState({ name: '', company: '', phone: '', email: '', address: '', contactPerson: '' });
  const [orderForm, setOrderForm] = useState({ supplierId: '', items: [], expectedDelivery: '', notes: '' });
  const [receiveForm, setReceiveForm] = useState({ items: [] });
  const { success, error } = useNotification();

  useEffect(() => { fetchSuppliers(); fetchOrders(); getMedicines({ limit: 200 }).then(res => setMedicines(res?.data || [])).catch(() => {}); }, []);

  const fetchSuppliers = async () => { setLoading(true); try { const res = await getSuppliers(); setSuppliers(res?.data || []); } catch {} finally { setLoading(false); }; };
  const fetchOrders = async () => { try { const res = await getPurchases(); setOrders(res?.data || []); } catch {} };

  // Supplier handlers
  const openSupplierCreate = () => { setEditing(null); setSupplierForm({ name: '', company: '', phone: '', email: '', address: '', contactPerson: '' }); setShowSupplierModal(true); };
  const openSupplierEdit = (s) => { setEditing(s); setSupplierForm({ name: s.name, company: s.company||'', phone: s.phone||'', email: s.email||'', address: s.address||'', contactPerson: s.contactPerson||'' }); setShowSupplierModal(true); };
  const handleSupplierSave = async (e) => { e.preventDefault(); setSaving(true); try { if (editing) { await updateSupplier(editing._id, supplierForm); success('Updated'); } else { await createSupplier(supplierForm); success('Added'); } setShowSupplierModal(false); fetchSuppliers(); } catch (err) { error('Failed'); } setSaving(false); };
  const handleSupplierDelete = async (id) => { if (!confirm('Delete?')) return; try { await deleteSupplier(id); success('Deleted'); fetchSuppliers(); } catch (err) { error('Failed'); } };

  // Order handlers
  const addOrderItem = () => setOrderForm({ ...orderForm, items: [...orderForm.items, { medicineName: '', quantity: 1, unitPrice: 0 }] });
  const removeOrderItem = (i) => setOrderForm({ ...orderForm, items: orderForm.items.filter((_, idx) => idx !== i) });
  const updateOrderItem = (i, field, value) => { const items = [...orderForm.items]; items[i][field] = value; if (field === 'quantity' || field === 'unitPrice') items[i].totalPrice = (items[i].quantity || 1) * (items[i].unitPrice || 0); setOrderForm({ ...orderForm, items }); };
  const orderTotal = orderForm.items.reduce((s, i) => s + ((i.quantity || 1) * (i.unitPrice || 0)), 0);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.supplierId || orderForm.items.length === 0) { error('Supplier and items required'); return; }
    setSaving(true);
    try { await createPurchase(orderForm); success('Order created'); setShowOrderModal(false); setOrderForm({ supplierId: '', items: [], expectedDelivery: '', notes: '' }); fetchOrders(); } catch (err) { error('Failed'); }
    setSaving(false);
  };

  const handleSendToSupplier = async (id) => { try { await sendToSupplier(id); success('Sent to supplier'); fetchOrders(); } catch (err) { error(err.response?.data?.message || 'Failed'); } };

  const openReceive = (order) => {
    setReceivingOrder(order);
    const items = (order.items || []).map(item => {
      const med = medicines.find(m => m.name.toLowerCase() === item.medicineName?.toLowerCase());
      return {
        medicineId: med?._id || '',
        medicineName: item.medicineName,
        orderedQty: item.quantity,
        receivedQty: item.quantity,
        newBP: med?.buyingPrice || '',
        newSP: med?.sellingPrice || '',
        dosage: med?.dosage || '',
        categoryId: med?.categoryId || '',
        batchNo: '',
        expiryDate: '',
        exists: !!med,
      };
    });
    setReceiveForm({ items });
    setShowReceiveModal(true);
  };

  const updateReceiveItem = (i, field, value) => {
    const items = [...receiveForm.items];
    items[i][field] = value;
    setReceiveForm({ items });
  };

  const handleReceive = async () => {
    setSaving(true);
    try { await receiveOrder(receivingOrder._id, { items: receiveForm.items }); success('Order received - inventory updated'); setShowReceiveModal(false); fetchOrders(); } catch (err) { error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const supplierColumns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'company', label: 'Company' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' },
    { key: 'actions', label: '', render: (r) => <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => openSupplierEdit(r)}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => handleSupplierDelete(r._id)} className="text-red-500"><Trash2 size={14} /></Button></div> },
  ];

  const orderColumns = [
    { key: 'orderNumber', label: 'Order #' },
    { key: 'supplierId', label: 'Supplier', render: (r) => r.supplierId?.name || 'N/A' },
    { key: 'items', label: 'Items', render: (r) => r.items?.length || 0 },
    { key: 'totalAmount', label: 'Total', render: (r) => formatCurrency(r.totalAmount) },
    { key: 'status', label: 'Status', render: (r) => <Badge color={r.status === 'draft' ? 'yellow' : r.status === 'ordered' ? 'blue' : r.status === 'received' ? 'green' : 'red'}>{r.status}</Badge> },
    { key: 'createdAt', label: 'Date', render: (r) => formatDate(r.createdAt) },
    { key: 'actions', label: '', render: (r) => (
      <div className="flex gap-1">
        {r.status === 'draft' && <Button size="sm" variant="ghost" onClick={() => handleSendToSupplier(r._id)} className="text-blue-500"><Send size={14} /></Button>}
        {(r.status === 'draft' || r.status === 'ordered') && <Button size="sm" variant="ghost" onClick={() => openReceive(r)} className="text-green-500"><Package size={14} /></Button>}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        {activeTab === 'suppliers' && <Button onClick={openSupplierCreate}><Plus size={18} /> Add Supplier</Button>}
        {activeTab === 'orders' && <Button onClick={() => { setOrderForm({ supplierId: '', items: [{ medicineName: '', quantity: 1, unitPrice: 0 }], expectedDelivery: '', notes: '' }); setShowOrderModal(true); }}><Plus size={18} /> New Order</Button>}
      </div>
      <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'suppliers' && (loading ? <Spinner /> : suppliers.length === 0 ? <Card className="text-center py-12"><Truck size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No suppliers</h3></Card> : <Table columns={supplierColumns} data={suppliers} />)}

      {activeTab === 'orders' && (loading ? <Spinner /> : orders.length === 0 ? <Card className="text-center py-12"><Package size={48} className="mx-auto text-gray-300 mb-4" /><h3 className="text-lg font-medium">No purchase orders</h3></Card> : <Table columns={orderColumns} data={orders} />)}

      {/* Supplier Modal */}
      <Modal isOpen={showSupplierModal} onClose={() => setShowSupplierModal(false)} title={editing ? 'Edit Supplier' : 'Add Supplier'} size="md">
        <form onSubmit={handleSupplierSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><Input label="Name *" value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name: e.target.value})} required /><Input label="Company" value={supplierForm.company} onChange={e => setSupplierForm({...supplierForm, company: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><Input label="Phone *" value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})} required /><Input label="Email" type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email: e.target.value})} /></div>
          <Input label="Address" value={supplierForm.address} onChange={e => setSupplierForm({...supplierForm, address: e.target.value})} />
          <Input label="Contact Person" value={supplierForm.contactPerson} onChange={e => setSupplierForm({...supplierForm, contactPerson: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowSupplierModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Save</Button></div>
        </form>
      </Modal>

      {/* Order Modal */}
      <Modal isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} title="New Purchase Order" size="lg">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Supplier *" value={orderForm.supplierId} onChange={e => setOrderForm({...orderForm, supplierId: e.target.value})} required options={[{ value: '', label: 'Select...' }, ...suppliers.map(s => ({ value: s._id, label: s.name }))]} />
            <Input label="Expected Delivery" type="date" value={orderForm.expectedDelivery} onChange={e => setOrderForm({...orderForm, expectedDelivery: e.target.value})} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><h4 className="font-medium text-sm">Items</h4><Button size="sm" variant="secondary" type="button" onClick={addOrderItem}><PlusIcon size={14} /> Add</Button></div>
            {orderForm.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-end p-2 bg-gray-50 dark:bg-gray-900 rounded">
                <Input value={item.medicineName} onChange={e => updateOrderItem(i, 'medicineName', e.target.value)} placeholder="Medicine" className="flex-1" />
                <Input type="number" value={item.quantity} onChange={e => updateOrderItem(i, 'quantity', e.target.value)} placeholder="Qty" className="w-20" />
                <Input type="number" value={item.unitPrice} onChange={e => updateOrderItem(i, 'unitPrice', e.target.value)} placeholder="Price" className="w-24" />
                <span className="text-sm font-bold w-24 text-right">{formatCurrency((item.quantity || 1) * (item.unitPrice || 0))}</span>
                {orderForm.items.length > 1 && <button type="button" onClick={() => removeOrderItem(i)} className="text-red-500 p-1"><X size={14} /></button>}
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3"><span>Total</span><span>{formatCurrency(orderTotal)}</span></div>
          <Input label="Notes" value={orderForm.notes} onChange={e => setOrderForm({...orderForm, notes: e.target.value})} />
          <div className="flex gap-3 justify-end"><Button variant="secondary" type="button" onClick={() => setShowOrderModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Create Order</Button></div>
        </form>
      </Modal>

      {/* Receive Modal */}
      <Modal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title={`Receive Order #${receivingOrder?.orderNumber}`} size="lg">
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {receiveForm.items.map((item, i) => (
            <Card key={i}>
              <div className="flex justify-between items-start mb-3">
                <div><h4 className="font-semibold">{item.medicineName}</h4><p className="text-xs text-gray-500">Ordered: {item.orderedQty}</p></div>
                <Badge color={item.exists ? 'green' : 'yellow'}>{item.exists ? 'Exists' : 'New'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Received Qty" type="number" value={item.receivedQty} onChange={e => updateReceiveItem(i, 'receivedQty', e.target.value)} />
                <Input label={`Buying Price${item.exists ? ' (leave empty = unchanged)' : ' *'}`} type="number" value={item.newBP} onChange={e => updateReceiveItem(i, 'newBP', e.target.value)} required={!item.exists} />
                <Input label={`Selling Price${item.exists ? ' (leave empty = unchanged)' : ' *'}`} type="number" value={item.newSP} onChange={e => updateReceiveItem(i, 'newSP', e.target.value)} required={!item.exists} />
                {!item.exists && (
                  <>
                    <Input label="Dosage" value={item.dosage} onChange={e => updateReceiveItem(i, 'dosage', e.target.value)} />
                    <Input label="Batch No" value={item.batchNo} onChange={e => updateReceiveItem(i, 'batchNo', e.target.value)} />
                    <Input label="Expiry Date" type="date" value={item.expiryDate} onChange={e => updateReceiveItem(i, 'expiryDate', e.target.value)} />
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="flex gap-3 justify-end mt-4"><Button variant="secondary" onClick={() => setShowReceiveModal(false)}>Cancel</Button><Button onClick={handleReceive} loading={saving}><Package size={16} /> Receive Order</Button></div>
      </Modal>
    </div>
  );
}