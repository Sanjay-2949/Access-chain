import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'feasible' | 'danger' | 'warning' | 'unknown' | 'default' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const base = 'inline-flex items-center font-mono font-semibold tracking-wider uppercase rounded';
  const sizes = { sm: 'text-[10px] px-2 py-0.5', md: 'text-xs px-2.5 py-1' };
  const variants = {
    feasible: 'bg-[var(--feasible-bg)] text-[var(--feasible)]',
    danger: 'bg-[var(--danger-bg)] text-[var(--danger)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    unknown: 'bg-gray-100 text-gray-500',
    default: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
    outline: 'border border-[var(--border)] text-[var(--muted-foreground)]',
  };
  return <span className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</span>;
}
