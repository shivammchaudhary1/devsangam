type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse rounded-[8px]',
        'bg-white/[0.025]',
        className,
      ].join(' ')}
    />
  );
}
