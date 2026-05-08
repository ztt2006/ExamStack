import { Alert, Loader } from "@mantine/core";
import { useDebounce, useRequest } from "ahooks";
import {
  AlertCircle,
  ArrowRight,
  Download,
  FileStack,
  FolderKanban,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { getResources } from "@/api/resources";
import { getSubjects } from "@/api/subjects";
import { EmptyState } from "@/components/common/empty-state";
import { ResourceCard } from "@/components/resource/resource-card";
import { ResourceFilters } from "@/components/resource/resource-filters";

export function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [resourceType, setResourceType] = useState("");
  const debouncedKeyword = useDebounce(keyword, { wait: 300 });

  const subjectsRequest = useRequest(getSubjects);
  const resourcesRequest = useRequest(
    () =>
      getResources({
        keyword: debouncedKeyword || undefined,
        subject_id: subjectId ? Number(subjectId) : undefined,
        resource_type: resourceType || undefined,
      }),
    {
      refreshDeps: [debouncedKeyword, subjectId, resourceType],
    },
  );

  const hotCount = resourcesRequest.data?.items.length ?? 0;
  const tags = useMemo(
    () => [
      `${subjectsRequest.data?.length ?? 0}+ 科目分区`,
      "上传 +5 积分",
      "下载 -5 积分",
    ],
    [subjectsRequest.data?.length],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="panel-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[oklch(0.52_0.01_255)]">
            Dashboard Overview
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-[oklch(0.18_0.01_255)]">
            期末资料共享平台总览
          </h2>
          <p className="mt-3 max-w-[70ch] text-sm leading-7 text-[oklch(0.44_0.01_255)]">
            在这里统一查看共享资料、按科目筛选、进入详情预览，或直接上传新的复习内容。
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[oklch(0.9_0.01_255)] bg-[oklch(0.98_0.003_255)] px-3 py-1.5 text-xs text-[oklch(0.42_0.01_255)]"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="metric-card">
              <div className="metric-icon">
                <FolderKanban size={18} />
              </div>
              <p className="metric-label">资料数量</p>
              <p className="metric-value">{hotCount}</p>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <FileStack size={18} />
              </div>
              <p className="metric-label">科目分类</p>
              <p className="metric-value">{subjectsRequest.data?.length ?? 0}</p>
            </div>
            <div className="metric-card">
              <div className="metric-icon">
                <Download size={18} />
              </div>
              <p className="metric-label">下载机制</p>
              <p className="metric-value">-5</p>
            </div>
          </div>
        </div>

        <div className="panel-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[oklch(0.52_0.01_255)]">
            Quick Actions
          </p>
          <div className="mt-4 space-y-3">
            <Link to="/upload" className="quick-link-card">
              <span className="flex items-center gap-3">
                <UploadCloud size={16} />
                上传新的共享资料
              </span>
              <ArrowRight size={15} />
            </Link>
            <a href="#resource-feed" className="quick-link-card">
              <span className="flex items-center gap-3">
                <FolderKanban size={16} />
                浏览当前资料列表
              </span>
              <ArrowRight size={15} />
            </a>
          </div>

          <div className="mt-6 rounded-xl border border-[oklch(0.92_0.01_255)] bg-[oklch(0.985_0.003_255)] p-4">
            <h3 className="text-sm font-semibold text-[oklch(0.2_0.01_255)]">使用说明</h3>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[oklch(0.44_0.01_255)]">
              <p>1. 上传资料可获得 5 积分。</p>
              <p>2. 下载资料会扣除 5 积分。</p>
              <p>3. 支持 PDF、图片和文档在线管理。</p>
            </div>
          </div>
        </div>
      </section>

      <ResourceFilters
        keyword={keyword}
        subjectId={subjectId}
        resourceType={resourceType}
        subjects={subjectsRequest.data ?? []}
        onKeywordChange={setKeyword}
        onSubjectChange={setSubjectId}
        onResourceTypeChange={setResourceType}
      />

      {resourcesRequest.error ? (
        <Alert
          icon={<AlertCircle size={16} />}
          radius="xl"
          color="red"
          title="资料广场加载失败"
        >
          请确认后端服务已启动，并且 `VITE_API_BASE_URL` 指向正确地址。
        </Alert>
      ) : null}

      <section id="resource-feed" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[oklch(0.52_0.01_255)]">
              Resource Table
            </p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-[oklch(0.18_0.01_255)]">
              最新共享资料
            </h2>
          </div>
          {resourcesRequest.loading ? (
            <div className="flex items-center gap-2 text-sm text-[oklch(0.44_0.01_255)]">
              <Loader size="sm" color="dark" />
              正在刷新数据
            </div>
          ) : null}
        </div>

        {!resourcesRequest.loading && (resourcesRequest.data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="还没有匹配的资料"
            description="换个关键词试试，或者你来上传第一份整理资料，让这个科目的资料流先热起来。"
            action={
              <Link
                to="/upload"
                className="admin-primary-btn inline-flex"
              >
                去上传
              </Link>
            }
          />
        ) : null}

        <div className="grid gap-5 xl:grid-cols-2">
          {resourcesRequest.data?.items.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>
    </div>
  );
}
