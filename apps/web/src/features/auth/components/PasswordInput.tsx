import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface PasswordInputProps extends React.ComponentProps<typeof Input> {}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={['pr-11', className].filter(Boolean).join(' ')}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-muted-foreground
          transition
          hover:text-amber-400
        "
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
