import { useState, useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';

export function Dropdown({ trigger, children, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setIsOpen(false));

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={cn('absolute right-0 mt-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg py-1 z-50 min-w-[160px]', className)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
      {children}
    </button>
  );
}