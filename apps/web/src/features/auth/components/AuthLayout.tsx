import type { ReactNode } from 'react';

import { AUTH_ASSETS } from '../constants/auth-assets';
import { DevSangamLogo } from '@/components/brand/DevSangamLogo';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#080a0f] text-white">
      <div
        className="
          grid
          min-h-dvh
          lg:grid-cols-[44%_56%]
        "
      >
        {/* =========================================
            LEFT DESKTOP ARTWORK
            ========================================= */}

        <aside
          className="
            relative
            hidden
            min-h-dvh
            overflow-hidden
            border-r
            border-white/[0.055]
            bg-[#05070a]
            lg:block
          "
        >
          <img
            src={AUTH_ASSETS.background}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="
    absolute
    inset-0
    h-full
    w-full
    object-cover
    object-center
  "
          />

          {/* Blend image toward form side */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-r
              from-transparent
              via-transparent
              to-[#080a0f]/30
            "
          />

          {/* Bottom cinematic shade */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-36
              bg-gradient-to-t
              from-black/30
              to-transparent
            "
          />

          {/* Right edge gold hint */}
          <div
            className="
              pointer-events-none
              absolute
              bottom-[10%]
              right-0
              top-[10%]
              w-px
              bg-gradient-to-b
              from-transparent
              via-[#d4af37]/15
              to-transparent
            "
          />
        </aside>

        {/* =========================================
            RIGHT AUTH AREA
            ========================================= */}

        <section
          className="
            relative
            flex
            min-h-dvh
            items-center
            justify-center
            overflow-hidden
            bg-[#080a0f]
            px-5
            py-8
            sm:px-8
            lg:px-10
            xl:px-16
          "
        >
          {/* Warm ambient glow */}
          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-[48%]
              h-[38rem]
              w-[38rem]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-amber-500/[0.025]
              blur-[130px]
            "
          />

          {/* Secondary glow */}
          <div
            className="
              pointer-events-none
              absolute
              -bottom-48
              right-0
              h-96
              w-96
              rounded-full
              bg-[#d4af37]/[0.025]
              blur-[120px]
            "
          />

          <div
            className="
              relative
              z-10
              w-full
              max-w-[570px]
            "
          >
            {/* Mobile branding only */}
            <div
              className="
                mb-7
                flex
                justify-center
                lg:hidden
              "
            >
              <DevSangamLogo />
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
