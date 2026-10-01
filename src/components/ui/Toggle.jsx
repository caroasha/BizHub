import { cn } from '../../utils/cn';

export function Toggle({ checked, onChange, label, className }) {
  return (
    <label className={cn('inline-flex items-center gap-2 cursor-pointer', className)}>
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-10 h-6 bg-[var(--border)] rounded-full peer-checked:bg-[var(--primary)] transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
      </div>
      {label && <span className="text-sm text-[var(--text)]">{label}</span>}
    </label>
  );
}