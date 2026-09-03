type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse rounded-[8px]',
        'bg-[var(--ds-white-03)]',
        className,
      ].join(' ')}
    />
  );
}
