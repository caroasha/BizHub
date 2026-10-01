import { cn } from '../../utils/cn';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-[var(--border)] rounded-lg', className)} />;
}