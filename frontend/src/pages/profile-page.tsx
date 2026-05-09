import { Alert, Loader, Progress } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, Medal, NotebookPen, UserCircle2 } from "lucide-react";

import { getMyProfile, getMyResources } from "@/api/users";
import { EmptyState } from "@/components/common/empty-state";
import { ResourceTable } from "@/components/resource/resource-table";

export function ProfilePage() {
  const profileRequest = useRequest(getMyProfile);
  const myResourcesRequest = useRequest(() => getMyResources());

  if (profileRequest.loading || myResourcesRequest.loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader color="sky" />
      </div>
    );
  }

  if (profileRequest.error || !profileRequest.data) {
    return (
      <Alert
        icon={<AlertCircle size={16} />}
        radius="xl"
        color="red"
        title="个人中心加载失败"
      >
        请确认登录状态正常，并检查后端服务是否可用。
      </Alert>
    );
  }

  const profile = profileRequest.data;
  const progressValue = Math.min((profile.points / 50) * 100, 100);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card hero-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="section-badge">My Space</div>
              <h1 className="section-title mt-3 text-[2.35rem]">
                {profile.username} 的共享空间
              </h1>
              <p className="page-copy mt-3">
                {profile.school} · 继续上传资料，为自己补积分，也让更多同学少走一点弯路。
              </p>
            </div>
            <div className="metric-icon h-14 w-14">
              <UserCircle2 size={30} />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <p className="metric-label">
                当前积分
              </p>
              <p className="metric-value">
                {profile.points}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                我的上传
              </p>
              <p className="metric-value">
                {profile.uploaded_count}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                社区状态
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                持续共享中
              </p>
            </div>
          </div>
        </div>

        <div className="panel-card p-6">
          <div className="flex items-center gap-3">
            <div className="metric-icon h-11 w-11">
              <Medal size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                积分进度
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                向下一个 50 分节点冲刺
              </h2>
            </div>
          </div>
          <Progress
            value={progressValue}
            size="xl"
            radius="xl"
            color="sky"
            className="mt-6"
          />
          <p className="page-copy mt-4">
            每上传一份资料就会补回 5 分。如果你近期常下载，可以把自己整理的重点、图表或真题一并分享出来。
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
              My Uploads
            </p>
            <h2 className="section-title mt-2">
              我上传过的资料
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.9_0.03_230)] bg-[oklch(0.99_0.012_232/.9)] px-4 py-2 text-sm text-[var(--color-ink-soft)]">
            <NotebookPen size={16} />
            {profile.uploaded_count} 份共享内容
          </div>
        </div>

        {(myResourcesRequest.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="你还没有上传任何资料"
            description="你的整理内容、复习提纲和往年题都可以直接发到广场。第一份上传，就能先把积分赚回来。"
          />
        ) : (
          <ResourceTable items={myResourcesRequest.data?.items ?? []} />
        )}
      </section>
    </div>
  );
}
