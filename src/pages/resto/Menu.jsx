import { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItem } from '../../api/resto/menu';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/format';
import { Search, Plus, Edit, Trash2, Utensils, AlertTriangle, Clock, Printer } from 'lucide-react';

export default function Menu() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useNotification();
  const businessName = user?.businessName || 'My Restaurant';

  const [form, setForm] = useState({
    name: '',
    category: 'Main Course',
    price: '',
    description: '',
    preparationTime: 15,
    available: true
  });

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMenuItems({ search });
      setItems(res?.data || []);
    } catch (err) {
      error('Failed to load menu items');
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Main Course', price: '', description: '', preparationTime: 15, available: true });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || '',
      preparationTime: item.preparationTime || 15,
      available: item.available
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      error('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        preparationTime: Number(form.preparationTime)
      };
      if (editing) {
        await updateMenuItem(editing._id, data);
        success('Menu item updated');
      } else {
        await createMenuItem(data);
        success('Menu item added');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      success('Menu item deleted');
      fetchData();
    } catch (err) {
      error('Failed to delete');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleMenuItem(id);
      success('Menu item toggled');
      fetchData();
    } catch (err) {
      error('Failed to toggle');
    }
  };

  // ============================================
  // Print Menu Function
  // ============================================
  const handlePrint = () => {
    const now = new Date().toLocaleString('en-KE');
    
    // Group items by category
    const groupedItems = {};
    items.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Menu - ${businessName}</title>
          <style>
            @page { 
              size: A4; 
              margin: 15mm;
            }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              font-size: 12px; 
              color: #1e293b;
              line-height: 1.5;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #f97316; 
              padding-bottom: 15px; 
              margin-bottom: 20px;
            }
            .header h1 { 
              color: #f97316; 
              margin: 0; 
              font-size: 28px;
              font-weight: 800;
            }
            .header p { 
              margin: 4px 0; 
              color: #64748b; 
              font-size: 13px;
            }
            .header .subtitle {
              font-size: 16px;
              font-weight: 600;
              color: #334155;
              margin: 8px 0;
            }
            .category { 
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .category h2 { 
              background: #f97316; 
              color: white; 
              padding: 8px 16px; 
              border-radius: 6px; 
              margin: 0 0 12px 0;
              font-size: 16px;
              font-weight: 700;
            }
            .menu-grid { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              gap: 12px;
            }
            .menu-item { 
              border: 1px solid #e2e8f0; 
              border-radius: 8px; 
              padding: 12px 16px;
              background: #fafafa;
            }
            .menu-item .name { 
              font-weight: 700; 
              font-size: 14px;
              color: #0f172a;
              margin-bottom: 2px;
            }
            .menu-item .price { 
              color: #f97316; 
              font-weight: 700;
              font-size: 15px;
            }
            .menu-item .description { 
              color: #64748b; 
              font-size: 12px;
              margin: 2px 0 4px 0;
            }
            .menu-item .prep-time { 
              color: #94a3b8; 
              font-size: 11px;
            }
            .menu-item .unavailable {
              color: #ef4444;
              font-size: 11px;
              font-weight: 600;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #94a3b8; 
              font-size: 10px; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 15px;
            }
            .print-date {
              text-align: right;
              font-size: 10px;
              color: #94a3b8;
              margin-bottom: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 10px;
              border-radius: 50px;
              font-size: 10px;
              font-weight: 600;
            }
            .status-available {
              background: #d1fae5;
              color: #065f46;
            }
            .status-unavailable {
              background: #fee2e2;
              color: #991b1b;
            }
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${businessName}</h1>
            <p>${user?.email || ''} | ${user?.phone || ''}</p>
            <div class="subtitle">📋 MENU</div>
          </div>

          <div class="print-date">Generated: ${now}</div>

          ${Object.keys(groupedItems).sort().map(category => `
            <div class="category">
              <h2>${category}</h2>
              <div class="menu-grid">
                ${groupedItems[category].map(item => `
                  <div class="menu-item">
                    <div class="name">${item.name}</div>
                    <div class="price">${formatCurrency(item.price)}</div>
                    ${item.description ? `<div class="description">${item.description}</div>` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">
                      <span class="prep-time">⏱️ ${item.preparationTime || 15} min</span>
                      ${item.available 
                        ? '<span class="status-badge status-available">Available</span>'
                        : '<span class="status-badge status-unavailable">Unavailable</span>'
                      }
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <div class="footer">
            <p>All prices are in Kenyan Shillings (KES)</p>
            <p>Generated by RestoManagerKE — ${now}</p>
            <p>${businessName} — All Rights Reserved</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          <\/script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={18} /> Print Menu
          </Button>
          <Button onClick={openCreate}>
            <Plus size={18} /> Add Menu Item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search menu items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Menu Grid */}
      {items.length === 0 ? (
        <Card className="text-center py-12">
          <Utensils size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No menu items</h3>
          <p className="text-sm text-gray-500 mt-1">
            {search ? 'Try a different search.' : 'Add your first menu item.'}
          </p>
          {!search && (
            <Button onClick={openCreate} className="mt-4">
              <Plus size={18} /> Add Menu Item
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item._id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggle(item._id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-500"
                    title={item.available ? 'Mark Unavailable' : 'Mark Available'}
                  >
                    {item.available ? '✅' : '❌'}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-500"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-bold text-green-600">{formatCurrency(item.price)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prep Time</p>
                  <p className="text-gray-900 dark:text-white flex items-center gap-1">
                    <Clock size={14} />
                    {item.preparationTime || 15} min
                  </p>
                </div>
              </div>

              {item.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Badge color={item.available ? 'green' : 'red'}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Badge>
                {!item.available && (
                  <Badge color="red" className="flex items-center gap-1">
                    <AlertTriangle size={12} /> Out of Stock
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Menu Item' : 'Add Menu Item'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Item Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <Select
            label="Category *"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: 'Appetizer', label: 'Appetizer' },
              { value: 'Main Course', label: 'Main Course' },
              { value: 'Dessert', label: 'Dessert' },
              { value: 'Beverage', label: 'Beverage' },
              { value: 'Side Dish', label: 'Side Dish' }
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (KES) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <Input
              label="Preparation Time (minutes)"
              type="number"
              value={form.preparationTime}
              onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
            />
          </div>

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of the dish"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">
              Available
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Update' : 'Add'} Menu Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}