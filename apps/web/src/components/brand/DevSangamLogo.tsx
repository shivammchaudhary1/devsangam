interface DevSangamLogoProps {
  compact?: boolean;
}

export function DevSangamLogo({ compact = false }: DevSangamLogoProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="
          relative
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-full
          border
          border-amber-400/30
          bg-amber-400/10
          text-[1.6rem]
          text-amber-300
          shadow-[0_0_28px_rgba(245,158,11,0.14)]
        "
      >
        <span aria-hidden="true" className="font-devanagari">
          ॐ
        </span>

        <div
          className="
            pointer-events-none
            absolute
            inset-[5px]
            rounded-full
            border
            border-amber-200/10
          "
        />
      </div>

      {!compact && (
        <div>
          <div
            className="
              font-display
              text-xl
              font-semibold
              tracking-[0.04em]
              ds-gold-text
            "
          >
            DevSangam
          </div>

          <div
            className="
              mt-0.5
              text-[10px]
              font-medium
              tracking-[0.12em]
              text-amber-200/65
            "
          >
            CHANT · CONNECT · TRANSFORM
          </div>
        </div>
      )}
    </div>
  );
}
