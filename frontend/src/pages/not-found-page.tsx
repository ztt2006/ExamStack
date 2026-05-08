import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="campus-panel max-w-xl p-8 text-center">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[oklch(0.47_0.05_250)]">
          404
        </p>
        <h1 className="mt-3 font-heading text-4xl font-black text-[oklch(0.23_0.05_255)]">
          这页资料好像走丢了
        </h1>
        <p className="mt-4 text-sm leading-8 text-[oklch(0.41_0.03_250)]">
          可能链接失效了，也可能它还没被放进资料广场。先回首页继续找找看。
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-[oklch(0.27_0.06_250)] px-5 py-3 text-sm font-semibold text-[oklch(0.98_0.02_95)]"
        >
          返回资料广场
        </Link>
      </div>
    </div>
  );
}
