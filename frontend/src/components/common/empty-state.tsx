import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-[oklch(0.86_0.03_80)] bg-[oklch(0.98_0.03_92)] p-8 text-left shadow-[0_24px_60px_-44px_oklch(0.32_0.08_40/.45)]">
      <div className="mb-4 inline-flex rounded-full bg-[oklch(0.9_0.08_70)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[oklch(0.38_0.1_45)]">
        暂时空空
      </div>
      <h3 className="font-heading text-2xl font-bold text-[oklch(0.25_0.05_255)]">
        {title}
      </h3>
      <p className="mt-3 max-w-[48ch] text-sm leading-7 text-[oklch(0.42_0.03_250)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
