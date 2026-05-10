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
        <p className="text-lg font-bold text-[var(--color-ink-strong)] group-[.dark-brand]:text-white">
          黑哥共享站
        </p>
        <p className="text-xs text-[var(--color-ink-soft)] group-[.dark-brand]:text-[#b8c4d6]">资料共享前台</p>
      </div>
    </div>
  );
}
