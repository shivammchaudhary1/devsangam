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
      className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-xs text-slate-400 transition hover:bg-red-500/[0.07] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={15} strokeWidth={1.8} className="animate-spin" />
      ) : (
        <LogOut size={15} strokeWidth={1.8} />
      )}

      <span>Sign Out</span>
    </button>
  );
}
