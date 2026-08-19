import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main
      className="
        grid
        min-h-dvh
        bg-background
        lg:grid-cols-[0.9fr_1.1fr]
      "
    >
      {/* Desktop Branding */}

      <section
        className="
          relative
          hidden
          overflow-hidden
          border-r
          border-border
          bg-[#090b10]
          lg:flex
          lg:flex-col
          lg:justify-center
          lg:px-16
        "
      >
        {/* ambient glow */}

        <div
          className="
            pointer-events-none
            absolute
            -left-24
            top-20
            h-96
            w-96
            rounded-full
            bg-amber-500/10
            blur-[110px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            bottom-10
            right-0
            h-72
            w-72
            rounded-full
            bg-[#d4af37]/10
            blur-[100px]
          "
        />

        <div className="relative z-10 max-w-md">
          <div
            className="
              mb-8
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              border
              border-amber-500/30
              bg-amber-500/10
              text-4xl
              text-amber-400
              shadow-[0_0_45px_rgba(245,158,11,0.18)]
            "
          >
            ॐ
          </div>

          <h1
            className="
              font-display
              text-5xl
              text-[#e5c07b]
            "
          >
            DevSangam
          </h1>

          <p
            className="
              mt-3
              text-sm
              font-medium
              tracking-wide
              text-[#d4af37]
            "
          >
            Chant. Connect. Transform.
          </p>

          <div
            className="
              my-10
              h-px
              w-32
              bg-gradient-to-r
              from-amber-500
              to-transparent
            "
          />

          <p
            className="
              max-w-sm
              text-lg
              leading-8
              text-muted-foreground
            "
          >
            Your sacred space for daily mantra practice and inner alignment.
          </p>

          <div
            className="
              mt-12
              font-serif
              text-lg
              leading-8
              text-[#d4af37]
            "
            lang="sa"
          >
            ॐ असतो मा सद्गमय ।
            <br />
            तमसो मा ज्योतिर्गमय ।
          </div>
        </div>
      </section>

      {/* Form */}

      <section
        className="
          relative
          flex
          items-center
          justify-center
          px-5
          py-10
          sm:px-10
          lg:px-16
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/4
            h-72
            w-72
            -translate-x-1/2
            rounded-full
            bg-amber-500/5
            blur-[100px]
          "
        />

        <div
          className="
            relative
            z-10
            w-full
            max-w-md
          "
        >
          {/* Mobile logo */}

          <div
            className="
              mb-10
              text-center
              lg:hidden
            "
          >
            <div
              className="
                mx-auto
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                border
                border-amber-500/30
                bg-amber-500/10
                text-2xl
                text-amber-400
              "
            >
              ॐ
            </div>

            <div
              className="
                font-display
                text-3xl
                text-[#e5c07b]
              "
            >
              DevSangam
            </div>

            <p
              className="
                mt-1
                text-xs
                text-[#d4af37]
              "
            >
              Chant. Connect. Transform.
            </p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}
