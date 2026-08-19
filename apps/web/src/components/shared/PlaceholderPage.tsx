interface PlaceholderPageProps {
  title: string;
  description: string;
}
// import { Button } from '@/components/ui/button';

// export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
//   return (
//     // <section className="mx-auto max-w-7xl p-5 md:p-8">
//     //   <div className="mb-8">
//     //     <h1 className="font-display text-3xl text-gold-soft">{title}</h1>

//     //     <p className="mt-2 text-muted-foreground">{description}</p>
//     //   </div>

//     //   <div className="ds-card p-6">
//     //     <p className="text-muted-foreground">Phase 1 placeholder</p>
//     //   </div>
//     // </section>
//     <>
//       <div className="bg-primary p-6 text-primary-foreground">
//         Tailwind works
//       </div>
//       <Button>DevSangam</Button>
//       <div className="ds-card p-6">Sacred Card</div>
//       <button className="ds-primary-button px-6">Start Session</button>
//       <div
//         className="
//     ds-japa-ring
//     h-64
//     w-64
//   "
//         style={
//           {
//             '--progress': '0.5turn',
//           } as React.CSSProperties
//         }
//       >
//         <span className="text-5xl text-gold-soft">54</span>
//       </div>
//     </>
//   );
// }

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
