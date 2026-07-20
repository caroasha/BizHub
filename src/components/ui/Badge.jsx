import { cn } from '../../utils/cn';

const colors = {
  green: 'bg-[var(--success)]/10 text-[var(--success)]',
  red: 'bg-[var(--danger)]/10 text-[var(--danger)]',
  yellow: 'bg-[var(--warning)]/10 text-[var(--warning)]',
  blue: 'bg-[var(--primary)]/10 text-[var(--primary)]',
  gray: 'bg-[var(--border)] text-[var(--text-muted)]',
};

export function Badge({ children, color = 'gray', className }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  );
}