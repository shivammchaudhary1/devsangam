import { LoadingSpinner } from './LoadingSpinner';
import type { ReactNode } from 'react';

type ActionLoaderProps = {
  loading: boolean;
  children: ReactNode;
  loadingLabel?: string;
  spinnerSize?: number;
};

export function ActionLoader({
  loading,
  children,
  loadingLabel = 'Working',
  spinnerSize = 13,
}: ActionLoaderProps) {
  if (!loading) {
    return children;
  }

  return (
    <>
      <LoadingSpinner size={spinnerSize} label={loadingLabel} />

      <span>{loadingLabel}</span>
    </>
  );
}
