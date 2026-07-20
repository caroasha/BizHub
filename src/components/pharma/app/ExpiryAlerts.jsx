import { useState, useEffect } from 'react';
import { getExpiryReport } from '../../../api/pharma/reports';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Spinner } from '../../ui/Spinner';

export function ExpiryAlerts({ tenantId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExpiryReport()
      .then(res => setItems(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!items.length) return <p className="text-gray-500 text-sm">No expiring medicines.</p>;

  return (
    <div className="space-y-2">
      {items.slice(0, 5).map(item => {
        const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return (
          <Card key={item._id} className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
              <p className="text-xs text-gray-500">Batch: {item.batchNo} | Stock: {item.stock}</p>
            </div>
            <Badge color={daysLeft <= 7 ? 'red' : daysLeft <= 30 ? 'yellow' : 'blue'}>
              {daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
            </Badge>
          </Card>
        );
      })}
    </div>
  );
}