export const MODULES = [
  { type: 'restaurant', name: 'RestoManagerKE', icon: '🍽️', slug: 'resto', color: '#ef4444' },
  { type: 'pharmacy', name: 'PharmaSys', icon: '💊', slug: 'pharma', color: '#22c55e' },
  { type: 'apartment', name: 'MyApartment', icon: '🏢', slug: 'apartment', color: '#3b82f6' },
  { type: 'electronics', name: 'ElectroStore', icon: '🔌', slug: 'electro', color: '#f59e0b' },
  { type: 'cyber', name: 'DigitalManager', icon: '💻', slug: 'cyber', color: '#8b5cf6' },
];

export const CYCLES = {
  trial: { label: 'Free Trial', color: 'blue' },
  monthly: { label: 'Monthly', color: 'green' },
  yearly: { label: 'Yearly', color: 'purple' },
  permanent: { label: 'Permanent', color: 'amber' },
};

export const STATUS_COLORS = {
  active: 'green',
  pending: 'yellow',
  suspended: 'red',
  cancelled: 'gray',
  trial: 'blue',
  trial_ended: 'orange',
};