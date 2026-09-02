import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable }: CardProps) {
  const base = 'bg-[var(--card)] border border-[var(--border)] rounded-lg';
  const hover = hoverable ? 'hover:border-[var(--primary)] hover:shadow-sm cursor-pointer transition-all duration-150' : '';
  return (
    <div className={`${base} ${hover} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
