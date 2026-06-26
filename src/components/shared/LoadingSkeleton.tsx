export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[4/5] bg-linen" />
          <div className="mt-4 h-4 w-2/3 bg-linen" />
          <div className="mt-2 h-3 w-1/2 bg-linen" />
        </div>
      ))}
    </div>
  );
}
