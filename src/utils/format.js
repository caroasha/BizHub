export const formatCurrency = (amount, currency = 'KES') => {
  if (amount === 0 || amount === '0') return 'KSh 0';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  const formats = {
    short: d.toLocaleDateString('en-KE'),
    long: d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
    iso: d.toISOString().split('T')[0],
  };
  return formats[format] || formats.short;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('254')) return `0${cleaned.slice(3)}`;
  return phone;
};

export const truncate = (text, length = 50) => {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export const formatStorage = (mb) => {
  if (mb === -1) return 'Unlimited';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
};

export const formatUsers = (count) => {
  if (count === -1) return 'Unlimited';
  return count.toString();
};