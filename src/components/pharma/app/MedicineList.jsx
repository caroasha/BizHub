import { useState, useEffect } from 'react';
import { getMedicines, deleteMedicine } from '../../../api/pharma/medicines';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { Table } from '../../ui/Table';
import { Pagination } from '../../ui/Pagination';
import { Modal } from '../../ui/Modal';
import { Spinner } from '../../ui/Spinner';
import { useNotification } from '../../../hooks/useNotification';
import { formatCurrency } from '../../../utils/format';

export function MedicineList({ tenantId }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const { success, error } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMedicines({ page, limit: 20, search });
      setMedicines(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err) {
      error('Failed to load medicines');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'genericName', label: 'Generic' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'stock', label: 'Stock', render: (row) => <Badge color={row.stock <= row.minStockAlert ? 'red' : 'green'}>{row.stock}</Badge> },
    { key: 'sellingPrice', label: 'Price', render: (row) => formatCurrency(row.sellingPrice) },
    { key: 'expiryDate', label: 'Expiry', render: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Button>+ Add Medicine</Button>
      </div>
      {loading ? <Spinner /> : (
        <>
          <Table columns={columns} data={medicines} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}