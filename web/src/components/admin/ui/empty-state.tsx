import type { ReactNode } from "react";

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-700">{title}</p>
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </div>
    </div>
  );
}
