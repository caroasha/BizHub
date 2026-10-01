import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { XIcon } from '../../utils/svg';

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className={cn('bg-[var(--bg)] rounded-xl shadow-2xl w-full max-h-[90vh] flex flex-col', sizes[size], className)} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text)]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface)] text-[var(--text-muted)]"><XIcon /></button>
        </div>
        <div className="flex-1 p-4 overflow-auto">{children}</div>
        {footer && <div className="flex justify-end gap-3 p-4 border-t border-[var(--border)]">{footer}</div>}
      </div>
    </div>
  );
}