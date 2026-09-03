import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { type ComponentProps,useState } from 'react';

type PasswordInputProps = ComponentProps<typeof Input>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={[
          `
            h-[50px]
            rounded-lg
            border-[var(--ds-border-soft)]
            bg-[var(--ds-night)]
            pr-12
            text-[var(--ds-cream)]
            placeholder:text-[var(--ds-muted)]
            hover:border-[var(--ds-border-gold)]
            focus-visible:border-[var(--ds-border-gold)]
            focus-visible:ring-[3px]
            focus-visible:ring-amber-500/[0.08]
          `,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="
          absolute
          right-3
          top-1/2
          flex
          h-8
          w-8
          -translate-y-1/2
          items-center
          justify-center
          rounded-md
          text-[var(--ds-muted)]
          transition
          hover:bg-[var(--ds-white-03)]
          hover:text-[#e0b859]
        "
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
