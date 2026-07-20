import { Link } from 'react-router-dom';
import { cn } from '../../../utils/cn';

export function MobileNav({ links = [] }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg)] border-t border-[var(--border)] z-40 lg:hidden">
      <div className="flex items-center justify-around h-14">
        {links.slice(0, 5).map(link => (
          <Link
            key={link.key}
            to={link.path}
            className="flex flex-col items-center gap-0.5 text-[var(--text-muted)] hover:text-[var(--primary)]"
          >
            {link.icon && <link.icon className="w-5 h-5" />}
            <span className="text-[10px]">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}