import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
  size?: number;
  className?: string;
  label?: string;
};

export function LoadingSpinner({
  size = 16,
  className = '',
  label = 'Loading',
}: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      aria-label={label}
      className={['animate-spin', 'text-[var(--ds-gold)]', className].join(' ')}
    />
  );
}
