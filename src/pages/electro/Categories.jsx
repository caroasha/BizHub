import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/electro/categories';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { useNotification } from '../../hooks/useNotification';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const { success, error } = useNotification();

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => { setLoading(true); try { const res = await getCategories(); setCategories(res?.data || []); } catch {} finally { setLoading(false); }; };

  const handleSave = async (e) => { e.preventDefault(); if (!form.name.trim()) return; try { if (editing) { await updateCategory(editing._id, form); success('Updated'); } else { await createCategory(form); success('Added'); } setEditing(null); setForm({ name: '', description: '' }); fetchData(); } catch (err) { error('Failed'); } };

  if (loading) return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
      <Card>
        <form onSubmit={handleSave} className="flex gap-2 mb-4"><Input placeholder="Category name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="flex-1" /><Button type="submit" size="sm">{editing ? 'Update' : 'Add'}</Button>{editing && <Button variant="secondary" size="sm" type="button" onClick={() => { setEditing(null); setForm({ name: '', description: '' }); }}>Cancel</Button>}</form>
        {categories.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">No categories</p> : <div className="space-y-1">{categories.map(c => <div key={c._id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"><span className="text-sm font-medium">{c.name}</span><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description||'' }); }}><Edit size={14} /></Button><Button size="sm" variant="ghost" onClick={() => deleteCategory(c._id).then(() => { success('Deleted'); fetchData(); })} className="text-red-500"><Trash2 size={14} /></Button></div></div>)}</div>}
      </Card>
    </div>
  );
}