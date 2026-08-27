export function SettingsBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[8%] top-[-180px] size-[380px] rounded-full bg-[var(--ds-amber-03)] blur-[125px]" />

      <div className="absolute bottom-[-220px] left-[6%] size-[420px] rounded-full bg-[var(--ds-amber-03)] blur-[130px]" />
    </div>
  );
}