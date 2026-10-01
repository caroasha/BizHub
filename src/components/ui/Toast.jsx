import { cn } from '../../utils/cn';
import { XIcon } from '../../utils/svg';

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
const borders = { success: 'border-[var(--success)]', error: 'border-[var(--danger)]', warning: 'border-[var(--warning)]', info: 'border-[var(--primary)]' };

export function Toast({ id, message, type = 'info', onRemove }) {
  return (
    <div className={cn('flex items-center gap-3 bg-[var(--bg)] border-l-4 rounded-lg shadow-lg p-4 min-w-[300px] animate-slide-in', borders[type])}>
      <span>{icons[type]}</span>
      <p className="flex-1 text-sm text-[var(--text)]">{message}</p>
      <button onClick={() => onRemove(id)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><XIcon className="w-4 h-4" /></button>
    </div>
  );
}