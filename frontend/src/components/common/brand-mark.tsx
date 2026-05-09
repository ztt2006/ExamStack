export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark-icon overflow-hidden">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="font-heading text-lg font-bold tracking-tight text-[var(--color-ink-strong)]">
          黑哥共享站
        </p>
        <p className="text-xs text-[var(--color-ink-soft)]">
          {/* 蓝天一样清爽的资料空间 */}
        </p>
      </div>
    </div>
  );
}
