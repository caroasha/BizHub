import { Link } from 'react-router-dom';
import { useSidebar } from '../../../hooks/useSidebar';
import { cn } from '../../../utils/cn';
import { XIcon } from '../../../utils/svg';

export function Sidebar({ links = [] }) {
  const { isOpen, activeMenu, setActiveMenu, close } = useSidebar();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={close} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-[var(--surface)] border-r border-[var(--border)] z-50 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] lg:hidden">
          <span className="font-bold text-[var(--text)]">Menu</span>
          <button onClick={close} className="text-[var(--text-muted)]"><XIcon /></button>
        </div>
        <nav className="p-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.key}
              to={link.path}
              onClick={close}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                activeMenu === link.key ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
              )}
            >
              {link.icon && <link.icon className="w-5 h-5" />}
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}