import {
  formatCompactNumber,
  formatDuration,
} from '../utils/profile-formatters';

type PracticeJourneyCardProps = {
  totalChants: number;
  totalMalas: number;
  totalCompletedSessions: number;
  totalPracticeSeconds: number;
  unavailable: boolean;
};

export function PracticeJourneyCard({
  totalChants,
  totalMalas,
  totalCompletedSessions,
  totalPracticeSeconds,
  unavailable,
}: PracticeJourneyCardProps) {
  return (
    <article className="overflow-hidden rounded-[11px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="border-b border-[var(--ds-border-soft)] px-4 py-4">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Practice Journey
        </h2>

        <p className="mt-1 text-[10px] text-[var(--ds-muted-soft)]">
          Lifetime completed Sadhana activity.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        <JourneyStat
          label="Chants"
          value={
            unavailable
              ? '—'
              : formatCompactNumber(totalChants)
          }
        />

        <JourneyStat
          label="Malas"
          value={
            unavailable
              ? '—'
              : formatCompactNumber(totalMalas)
          }
        />

        <JourneyStat
          label="Sessions"
          value={
            unavailable
              ? '—'
              : formatCompactNumber(totalCompletedSessions)
          }
        />

        <JourneyStat
          label="Practice Time"
          value={
            unavailable
              ? '—'
              : formatDuration(totalPracticeSeconds)
          }
        />
      </div>
    </article>
  );
}

type JourneyStatProps = {
  label: string;
  value: string;
};

function JourneyStat({
  label,
  value,
}: JourneyStatProps) {
  return (
    <div className="rounded-[8px] border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] p-4">
      <p className="font-serif text-[20px] text-[var(--ds-soft-gold)]">
        {value}
      </p>

      <p className="mt-1.5 text-[10px] text-[var(--ds-muted-soft)]">
        {label}
      </p>
    </div>
  );
}