export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white ${className}`}>{children}</div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
