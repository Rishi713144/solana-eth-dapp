import { cn } from '@/lib/utils';

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-xl', className)} />;
}

export function SkeletonRows({ count = 3, className }) {
  return (
    <div className={cn('space-y-2.5', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
