import { SettingsCard } from './SettingsCard';
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

type PasswordSettingsProps = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showPasswords: boolean;
  pending: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onShowPasswordsChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};

export function PasswordSettings({
  currentPassword,
  newPassword,
  confirmPassword,
  showPasswords,
  pending,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onShowPasswordsChange,
  onSubmit,
}: PasswordSettingsProps) {
  return (
    <SettingsCard
      icon={<KeyRound size={16} strokeWidth={1.7} />}
      title="Change Password"
      description="Confirm your current password before choosing a new one."
    >
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="space-y-3 p-4"
      >
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={onCurrentPasswordChange}
          visible={showPasswords}
          autoComplete="current-password"
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={onNewPasswordChange}
          visible={showPasswords}
          autoComplete="new-password"
        />

        <PasswordField
          label="Confirm New Password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          visible={showPasswords}
          autoComplete="new-password"
        />

        <div
          className={
            'flex flex-wrap items-center justify-between ' + 'gap-3 pt-1'
          }
        >
          <button
            type="button"
            onClick={() => onShowPasswordsChange(!showPasswords)}
            className={
              'flex items-center gap-2 text-[10px] ' +
              'text-[var(--ds-muted)] transition ' +
              'hover:text-[var(--ds-text)]'
            }
          >
            {showPasswords ? (
              <EyeOff size={13} strokeWidth={1.7} />
            ) : (
              <Eye size={13} strokeWidth={1.7} />
            )}

            {showPasswords ? 'Hide passwords' : 'Show passwords'}
          </button>

          <button
            type="submit"
            disabled={pending}
            className={
              'flex h-9 items-center justify-center gap-2 ' +
              'rounded-[7px] border ' +
              'border-[var(--ds-border-gold)] ' +
              'bg-[var(--ds-amber-08)] px-4 text-[11px] ' +
              'font-medium text-[var(--ds-soft-gold)] ' +
              'transition hover:bg-[var(--ds-amber-14)] ' +
              'disabled:cursor-not-allowed disabled:opacity-60'
            }
          >
            {pending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ShieldCheck size={13} strokeWidth={1.7} />
            )}
            Update Password
          </button>
        </div>

        <p className={'text-[9px] leading-4 ' + 'text-[var(--ds-muted-soft)]'}>
          Use at least 10 characters. Changing your password closes your other
          signed-in sessions.
        </p>
      </form>
    </SettingsCard>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  autoComplete: 'current-password' | 'new-password';
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  value,
  visible,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className={'text-[10px] font-medium ' + 'text-[var(--ds-text)]'}>
        {label}
      </span>

      <input
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        maxLength={128}
        onChange={(event) => onChange(event.target.value)}
        className={
          'mt-1.5 h-10 w-full rounded-[7px] border ' +
          'border-[var(--ds-border-soft)] ' +
          'bg-[var(--ds-night)] px-3 text-[12px] ' +
          'text-[var(--ds-cream)] outline-none transition ' +
          'focus:border-[var(--ds-border-gold)] ' +
          'focus:shadow-[0_0_0_2px_var(--ds-amber-05)]'
        }
      />
    </label>
  );
}
