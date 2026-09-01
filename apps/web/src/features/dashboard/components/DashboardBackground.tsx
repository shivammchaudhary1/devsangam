export function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[10%] top-[-150px] size-[330px] rounded-full bg-[var(--ds-amber-03)] blur-[120px]" />

      <div className="absolute bottom-[-220px] left-[8%] size-[400px] rounded-full bg-[var(--ds-amber-03)] blur-[130px]" />

      <div className="absolute right-[-180px] top-[32%] size-[360px] rounded-full border border-[var(--ds-amber-03)]" />
    </div>
  );
}
