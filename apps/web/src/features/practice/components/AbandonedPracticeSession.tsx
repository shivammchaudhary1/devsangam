import { APP_ROUTES } from '@/app/constants/routes.constants';
import { memo } from 'react';
import { useNavigate } from 'react-router';

export const AbandonedPracticeSession = memo(
  function AbandonedPracticeSession() {
    const navigate = useNavigate();

    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#07111f] px-4 text-white">
        <section className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0b1421] p-6 text-center">
          <h1 className="font-serif text-xl text-[#f0dfad]">Session ended</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            This practice session has already been exited.
          </p>

          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.practice)}
            className="mt-5 h-10 w-full rounded-xl border border-amber-300/60 bg-gradient-to-b from-[#f3c45d] to-[#d89627] text-sm font-semibold text-[#241704]"
          >
            Start New Practice
          </button>
        </section>
      </main>
    );
  }
);
