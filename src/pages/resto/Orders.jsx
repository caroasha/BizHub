import { useState, useEffect } from 'react';
import {
  getOrders,
  createOrder,
  updateOrderStatus,
  confirmOrderPayment,
  cancelOrder,
  dispatchOrder
} from '../../api/resto/orders';
import { getMenuItems } from '../../api/resto/menu';
import { getCustomers } from '../../api/resto/customers';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/format';
import {
  Search,
  Plus,
  Eye,
  Printer,
  CheckCircle,
  Utensils,
  Truck,
  XCircle,
  DollarSign,
  Clock,
  Package
} from 'lucide-react';

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Confirmed', label: 'Confirmed' },
  { key: 'Preparing', label: 'Preparing' },
  { key: 'Ready', label: 'Ready' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
];

const statusColors = {
  Pending: 'yellow',
  Confirmed: 'blue',
  Preparing: 'purple',
  Ready: 'green',
  Completed: 'gray',
  Cancelled: 'red',
  Dispatched: 'cyan',
};

export default function Orders() {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    items: [{ menuItemId: '', quantity: 1 }],
    orderType: 'takeaway',
    paymentMethod: 'Cash',
    notes: '',
    deliveryAddress: { street: '', city: '', landmark: '', instructions: '' }
  });

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    fetchCustomers();
  }, [search, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { search };
      if (activeTab !== 'all') params.status = activeTab;
      const res = await getOrders(params);
      setOrders(res?.data || []);
    } catch (err) {
      error('Failed to load orders');
    }
    setLoading(false);
  };

  const fetchMenuItems = async () => {
    try {
      const res = await getMenuItems({ available: true });
      setMenuItems(res?.data || []);
    } catch (err) {
      console.error('Failed to load menu items');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res?.data || []);
    } catch (err) {
      console.error('Failed to load customers');
    }
  };

  const openCreate = () => {
    setForm({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      items: [{ menuItemId: '', quantity: 1 }],
      orderType: 'takeaway',
      paymentMethod: 'Cash',
      notes: '',
      deliveryAddress: { street: '', city: '', landmark: '', instructions: '' }
    });
    setShowModal(true);
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async (id, status) => {
    if (!confirm(`Update order status to ${status}?`)) return;
    try {
      await updateOrderStatus(id, status);
      success(`Order ${status}`);
      fetchOrders();
    } catch (err) {
      error('Failed to update status');
    }
  };

  const handlePaymentConfirm = async (id) => {
    if (!confirm('Confirm payment for this order?')) return;
    try {
      await confirmOrderPayment(id);
      success('Payment confirmed');
      fetchOrders();
    } catch (err) {
      error('Failed to confirm payment');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id);
      success('Order cancelled');
      fetchOrders();
    } catch (err) {
      error('Failed to cancel order');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await dispatchOrder(id);
      success('Order dispatched');
      fetchOrders();
    } catch (err) {
      error('Failed to dispatch');
    }
  };

  const handlePrint = (order) => {
    const now = new Date().toLocaleString('en-KE');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order #${order.orderNumber}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px; margin-bottom: 14px; }
            .header h2 { color: #f97316; margin: 0; font-size: 22px; }
            .header p { margin: 4px 0; color: #64748b; font-size: 12px; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #e2e8f0; }
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
            <p>Order #${order.orderNumber}</p>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="section">
            <h3>Customer Details</h3>
            <div class="row"><span>Name</span><span>${order.customerName}</span></div>
            <div class="row"><span>Phone</span><span>${order.customerPhone || 'N/A'}</span></div>
            <div class="row"><span>Order Type</span><span>${order.orderType}</span></div>
            <div class="row"><span>Status</span><span>${order.orderStatus}</span></div>
            <div class="row"><span>Payment</span><span>${order.paymentMethod} - ${order.paymentStatus}</span></div>
          </div>
          <div class="section">
            <h3>Items</h3>
            <table>
              <tr><th>Item</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr>
              ${order.items.map(i => `
                <tr><td>${i.name}</td><td class="text-right">${i.quantity}</td><td class="text-right">${formatCurrency(i.unitPrice)}</td><td class="text-right">${formatCurrency(i.totalPrice)}</td></tr>
              `).join('')}
            </table>
            <div class="row total"><span>Total</span><span>${formatCurrency(order.totalAmount)}</span></div>
          </div>
          <div class="footer">Generated by RestoManagerKE — ${now}</div>
        </body>
      </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        items: form.items.filter(i => i.menuItemId)
      };
      await createOrder(data);
      success('Order created');
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create order');
    }
    setSaving(false);
  };

  const addItemRow = () => {
    setForm({
      ...form,
      items: [...form.items, { menuItemId: '', quantity: 1 }]
    });
  };

  const removeItemRow = (index) => {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  if (loading) {
    return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <Button onClick={openCreate}><Plus size={18} /> New Order</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs tabs={statusTabs} active={activeTab} onChange={setActiveTab} />

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No orders found</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first order</p>
          <Button onClick={openCreate} className="mt-4"><Plus size={18} /> New Order</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <Badge color={order.paymentStatus === 'Paid' ? 'green' : 'yellow'}>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={statusColors[order.orderStatus] || 'gray'}>
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 justify-center">
                      <button onClick={() => viewOrder(order)} className="p-1.5 rounded hover:bg-gray-100" title="View">
                        <Eye size={16} className="text-blue-500" />
                      </button>
                      <button onClick={() => handlePrint(order)} className="p-1.5 rounded hover:bg-gray-100" title="Print">
                        <Printer size={16} className="text-gray-500" />
                      </button>
                      {order.orderStatus === 'Pending' && (
                        <button onClick={() => handleStatusUpdate(order._id, 'Confirmed')} className="p-1.5 rounded hover:bg-gray-100" title="Confirm">
                          <CheckCircle size={16} className="text-green-500" />
                        </button>
                      )}
                      {order.orderStatus === 'Confirmed' && (
                        <button onClick={() => handleStatusUpdate(order._id, 'Preparing')} className="p-1.5 rounded hover:bg-gray-100" title="Prepare">
                          <Utensils size={16} className="text-purple-500" />
                        </button>
                      )}
                      {order.orderStatus === 'Preparing' && (
                        <button onClick={() => handleStatusUpdate(order._id, 'Ready')} className="p-1.5 rounded hover:bg-gray-100" title="Ready">
                          <Clock size={16} className="text-blue-500" />
                        </button>
                      )}
                      {order.orderStatus === 'Ready' && (
                        <button onClick={() => handleStatusUpdate(order._id, 'Completed')} className="p-1.5 rounded hover:bg-gray-100" title="Complete">
                          <CheckCircle size={16} className="text-green-600" />
                        </button>
                      )}
                      {order.orderStatus === 'Completed' && (
                        <button onClick={() => handleDispatch(order._id)} className="p-1.5 rounded hover:bg-gray-100" title="Dispatch">
                          <Truck size={16} className="text-cyan-500" />
                        </button>
                      )}
                      {order.paymentStatus === 'Pending' && (
                        <button onClick={() => handlePaymentConfirm(order._id)} className="p-1.5 rounded hover:bg-gray-100" title="Pay">
                          <DollarSign size={16} className="text-green-500" />
                        </button>
                      )}
                      {order.orderStatus === 'Pending' && (
                        <button onClick={() => handleCancel(order._id)} className="p-1.5 rounded hover:bg-gray-100" title="Cancel">
                          <XCircle size={16} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Order" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name *"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
          </div>
          <Input
            label="Email"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Order Type"
              value={form.orderType}
              onChange={(e) => setForm({ ...form, orderType: e.target.value })}
              options={[
                { value: 'takeaway', label: 'Takeaway' },
                { value: 'dine-in', label: 'Dine In' },
                { value: 'delivery', label: 'Delivery' }
              ]}
            />
            <Select
              label="Payment Method"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              options={[
                { value: 'Cash', label: 'Cash' },
                { value: 'M-PESA', label: 'M-PESA' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' }
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</label>
            {form.items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Select
                  value={item.menuItemId}
                  onChange={(e) => updateItem(index, 'menuItemId', e.target.value)}
                  options={[
                    { value: '', label: 'Select Item' },
                    ...menuItems.map(m => ({ value: m._id, label: `${m.name} - ${formatCurrency(m.price)}` }))
                  ]}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20"
                  min="1"
                />
                <Button type="button" variant="secondary" size="sm" onClick={() => removeItemRow(index)}>
                  ✕
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addItemRow}>
              + Add Item
            </Button>
          </div>
          <Input
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Order</Button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Order #</p><p className="font-medium">{selectedOrder.orderNumber}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><Badge color={statusColors[selectedOrder.orderStatus] || 'gray'}>{selectedOrder.orderStatus}</Badge></div>
              <div><p className="text-sm text-gray-500">Customer</p><p className="font-medium">{selectedOrder.customerName}</p></div>
              <div><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedOrder.customerPhone || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Order Type</p><p className="font-medium">{selectedOrder.orderType}</p></div>
              <div><p className="text-sm text-gray-500">Payment</p><p className="font-medium">{selectedOrder.paymentMethod} - {selectedOrder.paymentStatus}</p></div>
              <div><p className="text-sm text-gray-500">Total</p><p className="font-bold text-lg">{formatCurrency(selectedOrder.totalAmount)}</p></div>
              <div><p className="text-sm text-gray-500">Created</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-center">Qty</th><th className="px-3 py-2 text-right">Price</th><th className="px-3 py-2 text-right">Total</th></tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedOrder.notes && (
              <div><p className="text-sm text-gray-500">Notes</p><p className="text-sm">{selectedOrder.notes}</p></div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}