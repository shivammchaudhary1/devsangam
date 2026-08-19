import { Loader2 } from 'lucide-react';

export function AuthLoadingScreen() {
  return (
    <div
      className="
        flex
        min-h-dvh
        items-center
        justify-center
        bg-background
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            mb-5
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            border
            border-amber-500/30
            bg-amber-500/10
            text-2xl
            text-amber-400
          "
        >
          ॐ
        </div>

        <Loader2
          className="
            mx-auto
            animate-spin
            text-amber-500
          "
        />

        <p
          className="
            mt-4
            text-sm
            text-muted-foreground
          "
        >
          Restoring your sacred space...
        </p>
      </div>
    </div>
  );
}
