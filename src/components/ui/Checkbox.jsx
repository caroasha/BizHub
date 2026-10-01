export function Checkbox({ label, className, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]" {...props} />
      {label && <span className="text-sm text-[var(--text)]">{label}</span>}
    </label>
  );
}