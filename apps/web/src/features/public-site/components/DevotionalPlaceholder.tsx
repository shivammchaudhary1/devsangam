// TODO V2-004: Replace with approved devotional artwork; preserve aspect ratio.
export function DevotionalPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="ds-panel flex aspect-square w-full max-w-sm items-center justify-center justify-self-center p-8"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-5">
        <div className="flex size-full flex-col items-center justify-center rounded-full border border-[var(--ds-border-gold)]">
          <span className="font-devanagari text-7xl text-[var(--ds-soft-gold)]">
            ॐ
          </span>
          <span className="mt-4 font-display text-sm tracking-widest text-[var(--ds-gold)]">
            A moment of devotion
          </span>
        </div>
      </div>
    </div>
  );
}
