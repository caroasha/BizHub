import { cn } from '../../utils/cn';

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[var(--text)] mb-1">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y transition-all',
          error && 'border-[var(--danger)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}