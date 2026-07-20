import { cn } from '../../utils/cn';

export function Table({ columns = [], data = [], className }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)}>
        <thead>
          <tr className="border-b border-[var(--border)]">
            {columns.map(col => (
              <th key={col.key} className="text-left py-3 px-4 font-medium text-[var(--text-muted)]">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} className="py-8 text-center text-[var(--text-muted)]">No data</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="py-3 px-4 text-[var(--text)]">{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}