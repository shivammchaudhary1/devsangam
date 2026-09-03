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
        'relative flex h-[24px] w-[42px] items-center',
        'rounded-full border transition-all duration-200',

        enabled
          ? [
              'border-[var(--ds-border-gold)]',
              'bg-[var(--ds-gradient-gold)]',
              'shadow-[var(--ds-shadow-gold-inset)]',
            ].join(' ')
          : ['border-[var(--ds-border-soft)]', 'bg-[var(--ds-white-06)]'].join(
              ' '
            ),

        pending ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      {pending ? (
        <LoadingSpinner
          size={10}
          label="Saving preference"
          className={[
            'absolute left-1/2 top-1/2',
            '-translate-x-1/2 -translate-y-1/2',
          ].join(' ')}
        />
      ) : (
        <span
          aria-hidden="true"
          className={[
            'block size-[17px] rounded-full',
            'transition-all duration-200',

            enabled
              ? [
                  'translate-x-[21px]',
                  'bg-[#fff8e8]',
                  'shadow-[0_1px_5px_rgb(0_0_0/0.2)]',
                ].join(' ')
              : [
                  'translate-x-[3px]',
                  'bg-[var(--ds-muted-soft)]',
                  'shadow-[0_1px_3px_rgb(0_0_0/0.12)]',
                ].join(' '),
          ].join(' ')}
        />
      )}
    </button>
  );
}
