import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helper?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, error, helper, prefix, suffix, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-[var(--foreground)]">{label}</label>}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-[var(--muted-foreground)]">{prefix}</span>}
        <input
          id={inputId}
          className={`w-full px-3 py-2 bg-[var(--card)] border rounded text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent transition-all ${error ? 'border-[var(--danger)]' : 'border-[var(--border)]'} ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-[var(--muted-foreground)]">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      {helper && !error && <p className="text-xs text-[var(--muted-foreground)]">{helper}</p>}
    </div>
  );
}
