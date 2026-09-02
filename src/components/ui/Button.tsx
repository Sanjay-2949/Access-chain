import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = 'primary', size = 'md', children, fullWidth, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  const variants = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[#0c9490] active:bg-[#0a8480]',
    secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[#e0e6ef] active:bg-[#d4dce9]',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--secondary)] active:bg-[var(--muted)]',
    danger: 'bg-[var(--danger)] text-white hover:bg-red-600',
    outline: 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
