import { Button } from './Button';
import { ChevronLeft, ChevronRight } from '../../utils/svg';

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-[var(--text-muted)]">Page {page} of {totalPages}</span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}