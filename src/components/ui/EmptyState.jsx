export function EmptyState({ icon = '📭', title = 'No data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-[var(--text)]">{title}</h3>
      {description && <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}