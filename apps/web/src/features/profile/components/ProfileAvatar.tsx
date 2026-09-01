import { User } from 'lucide-react';

type ProfileAvatarProps = {
  avatar: string | null;
  initials: string;
};

export function ProfileAvatar({ avatar, initials }: ProfileAvatarProps) {
  return (
    <div className="relative flex size-[76px] shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="size-[62px] rounded-full object-cover"
        />
      ) : initials ? (
        <span className="font-serif text-[22px] text-[var(--ds-soft-gold)]">
          {initials}
        </span>
      ) : (
        <User size={28} className="text-[var(--ds-soft-gold)]" />
      )}
    </div>
  );
}
