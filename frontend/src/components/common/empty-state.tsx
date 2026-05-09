import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="panel-card sky-empty-state p-8 text-left">
      <div className="section-badge mb-4">
        Clear Horizon
      </div>
      <h3 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
        {title}
      </h3>
      <p className="page-copy mt-3 max-w-[48ch]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
