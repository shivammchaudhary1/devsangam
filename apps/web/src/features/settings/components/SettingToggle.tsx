import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

type SettingToggleProps = {
  enabled: boolean;
  pending: boolean;
  onToggle: () => void | Promise<void>;
};

export function SettingToggle({
  enabled,
  pending,
  onToggle,
}: SettingToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={pending}
      onClick={() => void onToggle()}
      className={[
        'relative flex h-[24px] w-[42px] items-center rounded-full border transition-all duration-200',
        enabled
          ? 'border-[#e1a541]/45 bg-[linear-gradient(90deg,#b96f22,#dda13e)]'
          : 'border-white/[0.09] bg-white/[0.055]',
        pending ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      {pending ? (
        <LoadingSpinner
          size={10}
          label="Saving preference"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        />
      ) : (
        <span
          className={[
            'block size-[17px] rounded-full shadow transition-transform duration-200',
            enabled
              ? 'translate-x-[21px] bg-[#fff1ce]'
              : 'translate-x-[3px] bg-[#858b94]',
          ].join(' ')}
        />
      )}
    </button>
  );
}
