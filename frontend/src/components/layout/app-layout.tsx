import { Drawer } from "@mantine/core";
import { BookCopy, BookOpenText, ChevronRight, LayoutDashboard, LogOut, Menu, UploadCloud, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/resources", label: "资料", icon: BookCopy },
  { to: "/knowledge-base", label: "知识库", icon: BookOpenText },
  { to: "/account", label: "个人中心", icon: UserRound },
  { to: "/my-uploads", label: "我的上传", icon: UploadCloud },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[linear-gradient(135deg,oklch(0.74_0.11_218),oklch(0.65_0.13_236))] text-white shadow-[0_14px_28px_oklch(0.66_0.08_230/.18)]"
                : "text-[var(--color-ink-soft)] hover:bg-white/80 hover:text-[var(--color-ink-strong)]",
            ].join(" ")
          }
        >
          <span className="flex items-center gap-3">
            <item.icon size={16} />
            {item.label}
          </span>
          <ChevronRight size={14} className="opacity-60" />
        </NavLink>
      ))}
    </nav>
  );
}

const routeMeta: Record<string, { title: string }> = {
  "/": {
    title: "总览",
  },
  "/resources": {
    title: "资料",
  },
  "/knowledge-base": {
    title: "知识库",
  },
  "/account": {
    title: "个人中心",
  },
  "/my-uploads": {
    title: "我的上传",
  },
};

export function AppLayout() {
  const [opened, setOpened] = useState(false);
  const location = useLocation();
  const { user, token, logout } = useAuthStore();
  const currentMeta =
    routeMeta[location.pathname] ??
    (location.pathname.startsWith("/resources/")
      ? {
          title: "资料详情",
        }
      : {
          title: "ExamStack",
        });

  return (
    <div className="sky-shell min-h-dvh text-[var(--color-ink)]">
      <div className="relative z-10 flex min-h-dvh">
        <aside className="hidden w-[296px] shrink-0 border-r border-white/40 bg-[oklch(0.985_0.012_232/.7)] lg:flex lg:flex-col lg:backdrop-blur-xl">
          <div className="border-b border-white/50 px-6 py-6">
            <Link to="/">
              <BrandMark />
            </Link>
          </div>

          <div className="flex-1 px-4 py-6">
            <NavLinks />
          </div>

          <div className="border-t border-white/50 p-4">
            {token && user ? (
              <div className="sidebar-card">
                <div className="flex items-center gap-3">
                  <div className="metric-icon">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink-strong)]">{user.username}</p>
                    <p className="text-xs text-[var(--color-ink-soft)]">{user.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="admin-secondary-btn mt-4 inline-flex w-full items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  退出登录
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" className="admin-secondary-btn block text-center">
                  登录
                </Link>
                <Link to="/register" className="admin-primary-btn block text-center">
                  注册
                </Link>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/45 bg-[oklch(0.985_0.012_232/.64)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/70 lg:hidden"
                  onClick={() => setOpened(true)}
                  aria-label="打开导航"
                >
                  <Menu />
                </Button>
                <div className="min-w-0">
                  <h1 className="truncate font-heading text-2xl font-bold text-[var(--color-ink-strong)]">
                    {currentMeta.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!user ? (
                  <div className="hidden items-center gap-3 sm:flex">
                    <Link to="/login" className="admin-secondary-btn">
                      登录
                    </Link>
                    <Link to="/register" className="admin-primary-btn">
                      注册
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>

        <Drawer
          opened={opened}
          onClose={() => setOpened(false)}
          position="left"
          size="82%"
          padding="md"
          radius="xl"
          overlayProps={{ opacity: 0.35, blur: 1 }}
          title={<BrandMark />}
        >
          <div className="flex h-full flex-col gap-6">
            <NavLinks onNavigate={() => setOpened(false)} />
            <div className="sidebar-card">
              {token && user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="metric-icon">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink-strong)]">{user.username}</p>
                      <p className="text-xs text-[var(--color-ink-soft)]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpened(false);
                    }}
                    className="admin-secondary-btn mt-4 inline-flex w-full items-center justify-center gap-2"
                  >
                    <LogOut size={15} />
                    退出登录
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setOpened(false)}
                    className="admin-secondary-btn block text-center"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpened(false)}
                    className="admin-primary-btn block text-center"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
