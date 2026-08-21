import { Loader2 } from 'lucide-react';

export function RouteLoadingFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#07111f] text-slate-400">
      <div className="flex items-center gap-3 text-sm">
        <Loader2 size={18} className="animate-spin text-amber-400" />

        <span>Loading DevSangam...</span>
      </div>
    </div>
  );
}
