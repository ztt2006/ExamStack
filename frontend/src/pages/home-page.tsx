import { Loader } from "@mantine/core";
import { useRequest } from "ahooks";
import { FolderKanban, Search, UploadCloud } from "lucide-react";
import { Link } from "react-router";

import { getResources } from "@/api/resources";

export function HomePage() {
  const resourcesRequest = useRequest(() => getResources({ page_size: 100 }));

  const hotCount = resourcesRequest.data?.items.length ?? 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <div className="metric-icon">
            <FolderKanban size={18} />
          </div>
          <p className="metric-label">文档</p>
          <p className="metric-value">{hotCount}</p>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <Search size={18} />
          </div>
          <p className="metric-label">搜索</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
            描述 / 文件名
          </p>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <UploadCloud size={18} />
          </div>
          <p className="metric-label">上传字段</p>
          <p className="mt-2 font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
            2 项
          </p>
        </div>
      </section>

      <section className="panel-card p-5 sm:p-6">
        <Link to="/resources" className="admin-primary-btn inline-flex items-center justify-center">
          打开资料
        </Link>
      </section>

      {resourcesRequest.loading ? (
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <Loader size="sm" color="sky" />
          加载中
        </div>
      ) : null}
    </div>
  );
}
