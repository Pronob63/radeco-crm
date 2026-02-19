interface DataTableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function DataTableSkeleton({ rows = 6, columns = 6 }: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="h-6 w-40 rounded-md bg-sand-100 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 rounded-md bg-sand-100 animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
