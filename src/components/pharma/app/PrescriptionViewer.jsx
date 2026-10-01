import { useState, useEffect } from 'react';
import { getPrescriptions } from '../../../api/pharma/prescriptions';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Table } from '../../ui/Table';
import { Spinner } from '../../ui/Spinner';

const statusColors = {
  pending: 'yellow', processing: 'blue', ready: 'green', dispensed: 'gray', cancelled: 'red',
};

export function PrescriptionViewer({ tenantId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrescriptions({ limit: 10 })
      .then(res => setPrescriptions(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'doctorName', label: 'Doctor' },
    { key: 'items', label: 'Items', render: (row) => `${row.items?.length || 0} items` },
    { key: 'status', label: 'Status', render: (row) => <Badge color={statusColors[row.status]}>{row.status}</Badge> },
  ];

  if (loading) return <Spinner />;

  return <Table columns={columns} data={prescriptions} />;
}