import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="panel-card hero-panel max-w-xl p-8 text-center">
        <div className="section-badge">404</div>
        <h1 className="section-title mt-3 text-[2.6rem]">
          页面不存在
        </h1>
        <p className="page-copy mt-4">
          请求的页面可能已被移除，或当前地址无效。请返回资料广场继续操作。
        </p>
        <Link
          to="/"
          className="admin-primary-btn mt-6 inline-flex"
        >
          返回资料广场
        </Link>
      </div>
    </div>
  );
}
