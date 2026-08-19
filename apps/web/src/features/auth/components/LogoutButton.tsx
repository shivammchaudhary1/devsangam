import { useState } from 'react';

import { Loader2, LogOut } from 'lucide-react';

import { useNavigate } from 'react-router';

import { useAuth } from '../hooks/useAuth';

export function LogoutButton() {
  const auth = useAuth();

  const navigate = useNavigate();

  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      await auth.logout();

      navigate('/auth/login', {
        replace: true,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-4
        py-3
        text-sm
        text-muted-foreground
        transition
        hover:bg-red-500/10
        hover:text-red-400
      "
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <LogOut size={18} />
      )}
      Sign Out
    </button>
  );
}
