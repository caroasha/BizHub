import { cn } from '../../utils/cn';

export function Card({ children, className, hover, ...props }) {
  return (
    <div
      className={cn(
        'bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6',
        hover && 'hover:shadow-lg hover:border-[var(--primary)] transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}