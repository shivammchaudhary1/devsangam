type ProgressRingProps = {
  progress: number;
  size: number;
  value: string;
  subValue?: string;
};

export function ProgressRing({
  progress,
  size,
  value,
  subValue,
}: ProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="relative flex items-center justify-center rounded-full shadow-[0_0_18px_rgba(216,154,53,0.08)]"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          var(--ds-amber-bright) 0%,
          var(--ds-soft-gold) ${normalizedProgress}%,
          rgba(255,255,255,0.055) ${normalizedProgress}%,
          rgba(255,255,255,0.055) 100%
        )`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-charcoal)] shadow-[inset_0_0_24px_rgba(0,0,0,0.5)]"
        style={{
          width: size - 11,
          height: size - 11,
        }}
      >
        <div className="text-center">
          <p
            className={[
              'font-serif leading-none text-[var(--ds-soft-gold)]',
              size >= 100 ? 'text-[20px]' : 'text-[17px]',
            ].join(' ')}
          >
            {value}
          </p>

          {subValue ? (
            <p className="mt-1.5 text-[10px] text-[var(--ds-muted)]">
              {subValue}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
