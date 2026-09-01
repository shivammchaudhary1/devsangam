import { FullScreenLoader } from '@/components/loading/FullScreenLoader';

export function RouteLoadingFallback() {
  return (
    <FullScreenLoader message="Loading DevSangam..." />
  );
}