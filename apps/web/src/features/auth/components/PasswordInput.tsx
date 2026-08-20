import { useState, type ComponentProps } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';

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
            border-[#343b49]
            bg-[#0d1118]
            pr-12
            text-[#f8fafc]
            placeholder:text-[#657080]
            hover:border-[#454e5d]
            focus-visible:border-[#c99836]/80
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
          text-[#758092]
          transition
          hover:bg-white/[0.04]
          hover:text-[#e0b859]
        "
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
