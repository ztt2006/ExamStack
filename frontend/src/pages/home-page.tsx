import { Alert, Loader } from "@mantine/core";
import { useRequest } from "ahooks";
import {
  AlertCircle,
  ArrowRight,
  BookCopy,
  BookOpenText,
  Medal,
  Sparkles,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";

import { getResources } from "@/api/resources";
import { getMyProfile, getTopUploaders } from "@/api/users";
import { useAuthStore } from "@/store/auth-store";
import { formatDate, formatFileSize, resolveBackendUrl } from "@/utils/resource";

const quickLinks = [
  {
    to: "/resources",
    title: "资料",
    description: "浏览公开资料，按文件名或描述快速检索。",
    icon: BookCopy,
  },
  {
    to: "/knowledge-base",
    title: "知识库",
    description: "进入知识沉淀区，后续继续扩展结构化内容。",
    icon: BookOpenText,
  },
  {
    to: "/my-uploads",
    title: "我的上传",
    description: "统一管理你上传过的资料，支持继续增删改查。",
    icon: UploadCloud,
  },
  {
    to: "/account",
    title: "个人中心",
    description: "查看积分、账号信息，并维护个人资料。",
    icon: UserRound,
  },
];

function getInitial(name: string) {
  return (name.trim().slice(0, 1) || "U").toUpperCase();
}

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const resourcesRequest = useRequest(() => getResources({ page: 1, page_size: 6 }));
  const topUploadersRequest = useRequest(getTopUploaders);
  const profileRequest = useRequest(getMyProfile, {
    ready: Boolean(user),
  });

  const resources = resourcesRequest.data?.items ?? [];
  const topUploaders = topUploadersRequest.data ?? [];
  const totalResources = resourcesRequest.data?.pagination.total ?? 0;
  const profile = profileRequest.data;
  const overviewLoading = resourcesRequest.loading || (Boolean(user) && profileRequest.loading);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-card hero-panel p-6 sm:p-8">
          <div className="section-badge">Overview</div>
          <h1 className="section-title mt-3 text-[2.5rem]">
            {user ? `欢迎回来，${user.username}` : "欢迎来到 ExamStack"}
          </h1>
          <p className="page-copy mt-4 max-w-[58ch]">
            这里是你的总览入口。上面快速跳转到资料、知识库、我的上传和个人中心，下面可以顺手看一眼平台内容和最近更新。
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/resources" className="admin-primary-btn inline-flex items-center justify-center gap-2">
              打开资料
              <ArrowRight size={16} />
            </Link>
            <Link to="/knowledge-base" className="admin-secondary-btn inline-flex items-center justify-center gap-2">
              进入知识库
            </Link>
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="flex items-center gap-3">
            <div className="metric-icon h-11 w-11">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                Current Focus
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                今日总览
              </h2>
            </div>
          </div>

          {overviewLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <Loader size="sm" color="sky" />
              正在汇总首页数据
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="metric-card">
                <p className="metric-label">平台资料</p>
                <p className="metric-value">{totalResources}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">搜索维度</p>
                <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                  描述 / 文件名
                </p>
              </div>
              <div className="metric-card">
                <p className="metric-label">我的上传</p>
                <p className="metric-value">{profile?.uploaded_count ?? 0}</p>
              </div>
              <div className="metric-card">
                <p className="metric-label">当前积分</p>
                <p className="metric-value">{profile?.points ?? user?.points ?? 0}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to} className="panel-card group p-5 transition-transform hover:-translate-y-0.5">
            <div className="metric-icon">
              <item.icon size={18} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--color-ink-strong)]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{item.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-sky-strong)]">
              立即进入
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="panel-card p-6">
          <div className="flex items-center gap-3">
            <div className="metric-icon h-11 w-11">
              <Medal size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                Top Uploaders
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                上传者排行
              </h2>
            </div>
          </div>

          {topUploadersRequest.loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <Loader size="sm" color="blue" />
              正在读取上传排行
            </div>
          ) : null}

          {topUploadersRequest.error ? (
            <Alert
              icon={<AlertCircle size={16} />}
              radius="md"
              color="red"
              title="上传排行加载失败"
              className="mt-6"
            >
              请稍后刷新重试。
            </Alert>
          ) : null}

          {!topUploadersRequest.loading && !topUploadersRequest.error ? (
            <div className="mt-6 space-y-3">
              {topUploaders.map((uploader, index) => {
                const avatarSrc = uploader.avatar_url ? resolveBackendUrl(uploader.avatar_url) : "";
                return (
                  <div
                    key={uploader.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold text-[var(--admin-primary)]">
                        {index + 1}
                      </span>
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#eff6ff] text-sm font-bold text-[#1d4ed8]">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={`${uploader.username} 的头像`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          getInitial(uploader.username)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--color-ink-strong)]">
                          {uploader.username}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                          当前积分 {uploader.points}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--color-ink-strong)]">
                        {uploader.uploaded_count}
                      </p>
                      <p className="text-xs text-[var(--color-ink-soft)]">份资料</p>
                    </div>
                  </div>
                );
              })}

              {topUploaders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--admin-border)] px-4 py-10 text-center text-sm text-[var(--color-ink-soft)]">
                  暂无上传者排行，上传第一份资料后这里会自动更新。
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="panel-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                Recent Resources
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                最近更新
              </h2>
            </div>
            <Link to="/resources" className="admin-secondary-btn">
              查看全部
            </Link>
          </div>

          {resourcesRequest.error ? (
            <Alert
              icon={<AlertCircle size={16} />}
              radius="xl"
              color="red"
              title="总览数据加载失败"
              className="mt-6"
            >
              无法读取最近资料，请稍后刷新重试。
            </Alert>
          ) : null}

          {!resourcesRequest.error ? (
            <div className="mt-6 space-y-3">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  to={`/resources/${resource.id}`}
                  className="block rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-4 transition-colors hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--color-ink-strong)]">
                        {resource.original_filename}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                        {resource.description}
                      </p>
                    </div>
                    <ArrowRight size={16} className="mt-1 shrink-0 text-[var(--color-sky-strong)]" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--color-ink-soft)]">
                    <span>{resource.uploader_name}</span>
                    <span>{formatFileSize(resource.file_size)}</span>
                    <span>{formatDate(resource.created_at)}</span>
                  </div>
                </Link>
              ))}

              {!resourcesRequest.loading && resources.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--admin-border)] px-4 py-10 text-center text-sm text-[var(--color-ink-soft)]">
                  目前还没有可展示的资料内容。
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
