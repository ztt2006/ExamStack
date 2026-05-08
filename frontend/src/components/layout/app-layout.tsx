import { Drawer } from "@mantine/core";
import {
  BookCopy,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Upload,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";

import { BrandMark } from "@/components/common/brand-mark";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { to: "/", label: "资料广场", icon: LayoutDashboard },
  { to: "/upload", label: "上传资料", icon: Upload },
  { to: "/profile", label: "个人中心", icon: UserRound },
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
                ? "bg-[oklch(0.14_0.01_255)] text-[oklch(0.98_0.01_255)]"
                : "text-[oklch(0.42_0.01_255)] hover:bg-[oklch(0.95_0.01_255)] hover:text-[oklch(0.18_0.01_255)]",
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

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "资料广场",
    description: "按科目、类型和关键词快速管理与查看共享资料。",
  },
  "/upload": {
    title: "上传资料",
    description: "新增 PDF、图片和文档资料，并自动进入共享列表。",
  },
  "/profile": {
    title: "个人中心",
    description: "查看积分、上传记录和个人资料概览。",
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
          description: "查看资料预览、下载信息与共享详情。",
        }
      : {
          title: "ExamStack",
          description: "校园期末资料共享平台。",
        });

  return (
    <div className="min-h-dvh bg-[var(--color-page)] text-[var(--color-ink)]">
      <div className="flex min-h-dvh">
        <aside className="hidden w-[272px] shrink-0 border-r border-[oklch(0.9_0.01_255)] bg-white lg:flex lg:flex-col">
          <div className="border-b border-[oklch(0.93_0.01_255)] px-6 py-5">
            <Link to="/">
              <BrandMark />
            </Link>
          </div>

          <div className="flex-1 space-y-8 px-4 py-6">
            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[oklch(0.55_0.01_255)]">
                Navigation
              </p>
              <div className="mt-3">
                <NavLinks />
              </div>
            </div>

            <div className="sidebar-card">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[oklch(0.96_0.01_255)] text-[oklch(0.25_0.01_255)]">
                  <BookCopy size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[oklch(0.22_0.01_255)]">
                    平台规则
                  </p>
                  <p className="text-xs text-[oklch(0.5_0.01_255)]">上传 +5 / 下载 -5</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[oklch(0.44_0.01_255)]">
                保持资料质量，帮助同学快速找到可直接使用的复习内容。
              </p>
            </div>
          </div>

          <div className="border-t border-[oklch(0.93_0.01_255)] p-4">
            {token && user ? (
              <div className="sidebar-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[oklch(0.15_0.01_255)] text-white">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[oklch(0.22_0.01_255)]">{user.username}</p>
                    <p className="text-xs text-[oklch(0.5_0.01_255)]">{user.school}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[oklch(0.97_0.01_255)] px-3 py-2">
                  <span className="text-sm text-[oklch(0.48_0.01_255)]">当前积分</span>
                  <span className="text-sm font-semibold text-[oklch(0.2_0.01_255)]">{user.points}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[oklch(0.9_0.01_255)] px-3 py-2.5 text-sm font-medium text-[oklch(0.35_0.01_255)]"
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
          <header className="sticky top-0 z-30 border-b border-[oklch(0.9_0.01_255)] bg-[oklch(0.985_0.003_255/.92)] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setOpened(true)}
                  aria-label="打开导航"
                >
                  <Menu />
                </Button>
                <div className="min-w-0">
                  <h1 className="truncate font-heading text-2xl font-bold text-[oklch(0.18_0.01_255)]">
                    {currentMeta.title}
                  </h1>
                  <p className="mt-1 truncate text-sm text-[oklch(0.5_0.01_255)]">
                    {currentMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <div className="hidden rounded-xl border border-[oklch(0.9_0.01_255)] bg-white px-3 py-2 text-sm text-[oklch(0.38_0.01_255)] sm:block">
                      当前积分 <span className="ml-2 font-semibold text-[oklch(0.18_0.01_255)]">{user.points}</span>
                    </div>
                    <Link to="/upload" className="admin-primary-btn inline-flex items-center gap-2">
                      <Plus size={15} />
                      上传资料
                    </Link>
                  </>
                ) : (
                  <div className="hidden items-center gap-3 sm:flex">
                    <Link to="/login" className="admin-secondary-btn">
                      登录
                    </Link>
                    <Link to="/register" className="admin-primary-btn">
                      注册
                    </Link>
                  </div>
                )}
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
          overlayProps={{ opacity: 0.35, blur: 1 }}
          title={<BrandMark />}
        >
          <div className="flex h-full flex-col gap-6">
            <NavLinks onNavigate={() => setOpened(false)} />
            <div className="sidebar-card">
              {token && user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[oklch(0.15_0.01_255)] text-white">
                      <UserRound size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[oklch(0.22_0.01_255)]">{user.username}</p>
                      <p className="text-xs text-[oklch(0.5_0.01_255)]">{user.school}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[oklch(0.97_0.01_255)] px-3 py-2">
                    <span className="text-sm text-[oklch(0.48_0.01_255)]">当前积分</span>
                    <span className="text-sm font-semibold text-[oklch(0.18_0.01_255)]">{user.points}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-6 text-[oklch(0.46_0.01_255)]">
                  登录后可上传资料、查看积分和管理个人共享记录。
                </p>
              )}
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
