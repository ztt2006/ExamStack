export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[oklch(0.2_0.03_255)] text-[oklch(0.98_0.01_255)]">
        <span className="font-heading text-sm font-bold">ES</span>
      </div>
      <div>
        <p className="font-heading text-lg font-bold tracking-tight text-[oklch(0.22_0.02_255)]">
          ExamStack
        </p>
        <p className="text-xs text-[oklch(0.5_0.02_255)]">
          期末资料管理台
        </p>
      </div>
    </div>
  );
}
