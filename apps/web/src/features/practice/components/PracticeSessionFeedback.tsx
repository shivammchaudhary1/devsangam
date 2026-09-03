import { APP_ROUTES } from '@/app/constants/routes.constants';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function PracticeSessionLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[var(--ds-obsidian)]">
      <Loader2 className="size-7 animate-spin text-amber-400" />
    </div>
  );
}

export function PracticeSessionError({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--ds-obsidian)] px-4 text-[var(--ds-cream)]">
      <section className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center">
        <h1 className="font-serif text-xl text-red-100">
          Unable to load practice
        </h1>

        <p className="mt-2 text-sm leading-6 text-red-100/60">{message}</p>

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.practice)}
          className="mt-5 h-10 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-sm text-slate-200"
        >
          Return to Practice
        </button>
      </section>
    </main>
  );
}
