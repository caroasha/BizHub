import { useState } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from '../../utils/svg';

export function Accordion({ items = [], className }) {
  const [open, setOpen] = useState(null);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, i) => (
        <div key={i} className="border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left text-[var(--text)] font-medium hover:bg-[var(--surface)] transition-colors"
          >
            {item.title}
            <ChevronDown className={cn('w-5 h-5 transition-transform', open === i && 'rotate-180')} />
          </button>
          {open === i && <div className="px-4 pb-4 text-[var(--text-muted)] text-sm">{item.content}</div>}
        </div>
      ))}
    </div>
  );
}