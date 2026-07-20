import { cn } from '../../utils/cn';

export function Tooltip({ children, content, position = 'top' }) {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group">
      {children}
      <div className={cn('absolute hidden group-hover:block z-50 px-2 py-1 text-xs bg-[var(--text)] text-[var(--bg)] rounded whitespace-nowrap', positions[position])}>
        {content}
      </div>
    </div>
  );
}