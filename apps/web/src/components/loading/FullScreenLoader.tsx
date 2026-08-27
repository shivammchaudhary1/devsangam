import { LoadingSpinner } from './LoadingSpinner';
import { DevSangamLogo } from '@/components/brand/DevSangamLogo';

type FullScreenLoaderProps = {
  message?: string;
};

export function FullScreenLoader({
  message = 'Loading your sacred space...',
}: FullScreenLoaderProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--ds-obsidian)] px-5 text-[var(--ds-cream)]">
      <div className="text-center">
        <div className="flex justify-center">
          <DevSangamLogo compact />
        </div>

        <div className="mt-6 flex justify-center">
          <LoadingSpinner size={18} label={message} />
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[var(--ds-muted)]">
          {message}
        </p>
      </div>
    </div>
  );
}
