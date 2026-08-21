import { useToggleFavorite } from '../hooks/useToggleFavorite';
import type { Mantra } from '@devsangam/types';
import { Heart, Loader2 } from 'lucide-react';

type FavoriteButtonProps = {
  mantra: Mantra;
  isFavorite: boolean;
  variant?: 'card' | 'detail';
};

export function FavoriteButton({
  mantra,
  isFavorite,
  variant = 'card',
}: FavoriteButtonProps) {
  const toggleFavorite = useToggleFavorite();

  const pending = toggleFavorite.isPending;

  const size = variant === 'detail' ? 20 : 16;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        toggleFavorite.mutate({
          mantra,
          isFavorite,
        });
      }}
      aria-label={
        isFavorite
          ? `Remove ${mantra.title} from favorites`
          : `Add ${mantra.title} to favorites`
      }
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className={[
        'inline-flex items-center justify-center rounded-full border transition',
        'disabled:cursor-not-allowed disabled:opacity-60',

        variant === 'detail' ? 'h-11 w-11' : 'h-8 w-8',

        isFavorite
          ? 'border-amber-400/40 bg-amber-400/[0.12] text-amber-300'
          : 'border-white/10 bg-[#07111f]/70 text-slate-400 hover:border-amber-400/30 hover:text-amber-300',
      ].join(' ')}
    >
      {pending ? (
        <Loader2 size={size} className="animate-spin" />
      ) : (
        <Heart
          size={size}
          strokeWidth={1.8}
          fill={isFavorite ? 'currentColor' : 'none'}
        />
      )}
    </button>
  );
}
