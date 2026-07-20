import { cn } from '../../utils/cn';

export function Tabs({ tabs = [], active, onChange, className }) {
  return (
    <div className={cn('flex border-b border-[var(--border)]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            active === tab.key
              ? 'text-[var(--primary)] border-[var(--primary)]'
              : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}