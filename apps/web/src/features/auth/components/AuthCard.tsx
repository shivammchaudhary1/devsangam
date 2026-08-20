import type { ReactNode } from 'react';

import { ChevronDown, Globe2 } from 'lucide-react';

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div
      className="
        relative
        w-full

        bg-transparent
        px-0
        py-0

        lg:rounded-[18px]
        lg:border
        lg:border-[#313846]
        lg:bg-[#11151d]/95
        lg:px-10
        lg:pb-9
        lg:pt-10
        lg:shadow-[0_28px_90px_rgba(0,0,0,0.38)]
        lg:backdrop-blur-xl
      "
    >
      {/* Desktop language visual */}
      <div
        className="
          absolute
          right-5
          top-5
          hidden
          items-center
          gap-2
          rounded-lg
          border
          border-[#343b48]
          bg-[#10131a]
          px-3
          py-2
          text-xs
          text-[#b8bec8]
          lg:flex
        "
      >
        <Globe2 size={14} />

        <span>English</span>

        <ChevronDown size={13} className="text-[#747c89]" />
      </div>

      {/* Header */}
      <header className="mb-8 text-center lg:pt-9">
        <h1
          className="
            font-display
            text-[2rem]
            font-medium
            leading-tight
            tracking-[-0.025em]
            text-[#f3e8d4]
            sm:text-[2.25rem]
          "
        >
          {title}
        </h1>

        {/* ornamental divider */}

        <div
          className="
            mx-auto
            my-4
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <span
            className="
              h-px
              w-12
              bg-gradient-to-r
              from-transparent
              to-[#c9942f]/70
            "
          />

          <span
            className="
              h-[6px]
              w-[6px]
              rotate-45
              border
              border-[#d6a53f]
            "
          />

          <span
            className="
              h-px
              w-12
              bg-gradient-to-l
              from-transparent
              to-[#c9942f]/70
            "
          />
        </div>

        <p
          className="
            text-sm
            leading-6
            text-[#9aa2af]
          "
        >
          {description}
        </p>
      </header>

      {children}
    </div>
  );
}
