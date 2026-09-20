import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      {description && <p className="max-w-sm text-sm text-white/60">{description}</p>}
      {action}
    </div>
  );
}
