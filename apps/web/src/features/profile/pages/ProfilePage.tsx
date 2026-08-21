import { LogOut, User } from 'lucide-react';

import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 pb-28 pt-7 text-white md:px-8 md:pb-10 lg:px-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
            Your Space
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold md:text-4xl">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your DevSangam experience.
          </p>
        </section>

        {/* Profile card */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/[0.08]">
              <User size={24} strokeWidth={1.7} className="text-amber-300" />
            </div>

            <div>
              <h2 className="font-medium text-white">DevSangam Profile</h2>

              <p className="mt-1 text-sm text-slate-400">
                Your profile details will appear here.
              </p>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* MOBILE-ONLY LOGOUT SECTION */}
        {/* ================================= */}

        <section className="mt-8 md:hidden">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Account
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-2">
            <div className="mb-1 flex items-center gap-3 px-3 py-2">
              <LogOut size={17} strokeWidth={1.8} className="text-slate-500" />

              <span className="text-xs text-slate-500">Account session</span>
            </div>

            <LogoutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
