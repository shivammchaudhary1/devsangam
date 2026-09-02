import { Loader2, User } from 'lucide-react';

type ProfileAvatarProps = {
  avatar: string | null;
  initials: string;
  busy?: boolean;
};

export function ProfileAvatar({
  avatar,
  initials,
  busy = false,
}: ProfileAvatarProps) {
  return (
    <div
      className={
        'relative flex size-[76px] shrink-0 items-center justify-center ' +
        'overflow-hidden rounded-full border border-[var(--ds-border-gold)] ' +
        'bg-[var(--ds-amber-05)]'
      }
    >
      {avatar ? (
        <img
          src={avatar}
          alt="Profile"
          decoding="async"
          className="size-full object-cover"
        />
      ) : initials ? (
        <span className="font-serif text-[22px] text-[var(--ds-soft-gold)]">
          {initials}
        </span>
      ) : (
        <User size={28} className="text-[var(--ds-soft-gold)]" />
      )}

      {busy ? (
        <div
          className={
            'absolute inset-0 flex items-center justify-center ' +
            'bg-black/60 backdrop-blur-[1px]'
          }
        >
          <Loader2
            size={20}
            className="animate-spin text-[var(--ds-soft-gold)]"
          />
        </div>
      ) : null}
    </div>
  );
}
