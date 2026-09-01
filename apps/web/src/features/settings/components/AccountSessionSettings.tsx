import { SettingsCard } from './SettingsCard';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { LogOut } from 'lucide-react';

type AccountSessionSettingsProps = {
  email: string;
};

export function AccountSessionSettings({ email }: AccountSessionSettingsProps) {
  return (
    <SettingsCard
      icon={<LogOut size={16} strokeWidth={1.7} />}
      title="Account Session"
      description={`Signed in as ${email}.`}
    >
      <div className="p-2">
        <LogoutButton />
      </div>
    </SettingsCard>
  );
}
