import { Drawer } from "@mantine/core";
import { BookCopy, BookOpenText, ChevronRight, LayoutDashboard, LogOut, Menu, UploadCloud, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { resolveBackendUrl } from "@/utils/resource";

const navItems = [
  { to: "/", label: "总览", icon: LayoutDashboard },
  { to: "/resources", label: "资料", icon: BookCopy },
  { to: "/knowledge-base", label: "知识库", icon: BookOpenText },
  { to: "/account", label: "个人中心", icon: UserRound },
  { to: "/my-uploads", label: "我的上传", icon: UploadCloud },
];

function NavLinks({ onNavigate, tone = "light" }: { onNavigate?: () => void; tone?: "dark" | "light" }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              "flex h-12 items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#2563eb] text-white"
                : tone === "dark"
                  ? "text-[#c9d5e7] hover:bg-white/10 hover:text-white"
                  : "text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-ink)]",
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

function getUserInitial(username?: string) {
  return (username?.trim().slice(0, 1) || "U").toUpperCase();
}

function UserAvatar({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]> }) {
  const avatarSrc = user.avatar_url ? resolveBackendUrl(user.avatar_url) : "";

  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#eff6ff] text-sm font-bold text-[#1d4ed8]">
      {avatarSrc ? (
        <img src={avatarSrc} alt={`${user.username} 的头像`} className="h-full w-full object-cover" />
      ) : (
        getUserInitial(user.username)
      )}
    </div>
  );
}

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
    <div className="min-h-dvh text-[var(--color-ink)]">
      <div className="flex min-h-dvh">
        <aside className="hidden w-[248px] shrink-0 border-r border-[var(--admin-border)] bg-white text-[var(--admin-ink)] lg:flex lg:flex-col">
          <div className="flex h-[72px] items-center border-b border-[var(--admin-border)] px-5">
            <Link to="/">
              <BrandMark />
            </Link>
          </div>

          <div className="flex-1 px-3 py-5">
            <NavLinks tone="light" />
          </div>

          <div className="px-4 pb-4">
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 py-3">
              <p className="text-xs font-medium text-[var(--admin-muted)]">QQ 群</p>
              <p className="mt-1 text-sm font-semibold text-[var(--admin-ink)]">256333372</p>
            </div>
          </div>

          <div className="border-t border-[var(--admin-border)] p-4">
            {token && user ? (
              <div className="rounded-lg border border-[var(--admin-border)] bg-white p-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--admin-ink)]">{user.username}</p>
                    <p className="truncate text-xs text-[var(--admin-muted)]">{user.email}</p>
                  </div>
                </div>
                <div className="my-3 h-px bg-[var(--admin-border)]" />
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-medium text-[var(--admin-muted)] transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
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
          <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-white/90 backdrop-blur">
            <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white lg:hidden"
                  onClick={() => setOpened(true)}
                  aria-label="打开导航"
                >
                  <Menu />
                </Button>
                <div className="min-w-0">
                  <div className="hidden items-center gap-2 text-sm text-[var(--admin-muted)] sm:flex">
                    <span>前台</span>
                    <ChevronRight size={14} />
                    <span>{currentMeta.title}</span>
                  </div>
                  <h1 className="truncate text-2xl font-bold text-[var(--color-ink-strong)]">
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
          radius="md"
          overlayProps={{ opacity: 0.35, blur: 0 }}
          title={<BrandMark />}
        >
          <div className="flex h-full flex-col gap-6">
            <NavLinks tone="light" onNavigate={() => setOpened(false)} />
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-3 py-3">
              <p className="text-xs font-medium text-[var(--admin-muted)]">QQ 群</p>
              <p className="mt-1 text-sm font-semibold text-[var(--admin-ink)]">256333372</p>
            </div>
            <div className="sidebar-card">
              {token && user ? (
                <>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-ink-strong)]">{user.username}</p>
                      <p className="text-xs text-[var(--color-ink-soft)]">{user.email}</p>
                    </div>
                  </div>
                  <div className="my-3 h-px bg-[var(--admin-border)]" />
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpened(false);
                    }}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-medium text-[var(--admin-muted)] transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
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
