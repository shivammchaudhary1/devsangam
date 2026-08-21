interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section
      className="
        mx-auto
        max-w-7xl
        p-5
        md:p-8
      "
    >
      <header className="mb-8">
        <p
          className="
            mb-2
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-amber-500
          "
        >
          Sacred Practice
        </p>

        <h1
          className="
            font-display
            text-3xl
            text-[#e5c07b]
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            max-w-xl
            text-sm
            text-muted-foreground
          "
        >
          {description}
        </p>
      </header>

      <div
        className="
          rounded-2xl
          border
          border-border
          bg-card
          p-6
          shadow-xl
          shadow-black/20
        "
      >
        <p className="text-card-foreground">DevSangam Phase 1</p>

        <p
          className="
            mt-2
            text-sm
            text-muted-foreground
          "
        >
          Foundation and design system are working.
        </p>
      </div>
    </section>
  );
}
