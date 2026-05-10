import { Select, TextInput } from "@mantine/core";
import { Download, FileText, ImageIcon, NotebookTabs } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { useEffect, useState } from "react";

import type { Pagination, Resource } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate, formatFileSize, resolveBackendUrl } from "@/utils/resource";
import { buildPaginationItems, buildPaginationSummary } from "@/utils/pagination";

function iconForType(type: string) {
  if (type === "pdf") {
    return <FileText size={16} />;
  }
  if (type === "image") {
    return <ImageIcon size={16} />;
  }
  return <NotebookTabs size={16} />;
}

interface ResourceTableProps {
  items: Resource[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  renderActions?: (resource: Resource) => ReactNode;
}

function getInitial(name: string) {
  return (name.trim().slice(0, 1) || "U").toUpperCase();
}

function UploaderCell({ resource }: { resource: Resource }) {
  const avatarSrc = resource.uploader_avatar_url
    ? resolveBackendUrl(resource.uploader_avatar_url)
    : "";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#eff6ff] text-xs font-bold text-[#1d4ed8]">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={`${resource.uploader_name} 的头像`}
            className="h-full w-full object-cover"
          />
        ) : (
          getInitial(resource.uploader_name)
        )}
      </div>
      <span className="truncate text-sm font-medium text-[var(--color-ink)]">
        {resource.uploader_name}
      </span>
    </div>
  );
}

export function ResourceTable({
  items,
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
  renderActions,
}: ResourceTableProps) {
  const desktopGridClass = renderActions
    ? "lg:grid-cols-[minmax(0,2.4fr)_1fr_0.8fr_260px]"
    : "lg:grid-cols-[minmax(0,2.8fr)_1fr_0.8fr_120px]";
  const summary = pagination
    ? buildPaginationSummary(
        pagination.total,
        pagination.page,
        pagination.page_size,
      )
    : null;
  const pageItems = summary
    ? buildPaginationItems(summary.currentPage, summary.totalPages)
    : [];
  const [jumpPage, setJumpPage] = useState("");

  useEffect(() => {
    if (summary) {
      setJumpPage(String(summary.currentPage));
    }
  }, [summary?.currentPage]);

  const handleJump = () => {
    if (!summary) {
      return;
    }
    const nextPage = Number.parseInt(jumpPage, 10);
    if (Number.isNaN(nextPage)) {
      setJumpPage(String(summary.currentPage));
      return;
    }
    const boundedPage = Math.min(Math.max(nextPage, 1), summary.totalPages);
    setJumpPage(String(boundedPage));
    onPageChange?.(boundedPage);
  };

  return (
    <div className="panel-card overflow-hidden">
      <div
        className={`hidden gap-4 border-b border-[oklch(0.92_0.02_230)] bg-[oklch(0.99_0.012_230/.9)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-sky-strong)] lg:grid ${desktopGridClass}`}
      >
        <span>文档</span>
        <span>上传者</span>
        <span>大小 / 下载</span>
        <span className="text-right">操作</span>
      </div>

      <div className="divide-y divide-[oklch(0.93_0.02_230)]">
        {!items.length && !loading ? (
          <div className="px-5 py-14 text-center text-sm text-[var(--color-ink-soft)]">
            当前没有匹配的文档，试试换一个关键词，或者先上传一份资料。
          </div>
        ) : null}

        {items.map((resource) => (
          <article
            key={resource.id}
            className="px-4 py-4 transition-colors hover:bg-[oklch(0.99_0.015_228/.85)] sm:px-5"
          >
            <div className={`hidden items-center gap-4 lg:grid ${desktopGridClass}`}>
              <div className="min-w-0">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[oklch(0.9_0.03_228)] bg-[oklch(0.995_0.012_230/.95)] text-[var(--color-sky-strong)]">
                    {iconForType(resource.mime_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[var(--color-ink-strong)]">
                      {resource.original_filename}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--color-ink-soft)]">
                      {resource.description}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                      {formatDate(resource.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <UploaderCell resource={resource} />

              <div className="text-sm text-[var(--color-ink)]">
                {formatFileSize(resource.file_size)} / {resource.download_count}
              </div>

              <div className="flex justify-end">
                {renderActions ? (
                  <div className="flex justify-end gap-2 whitespace-nowrap">{renderActions(resource)}</div>
                ) : (
                  <Link to={`/resources/${resource.id}`} className="admin-secondary-btn text-center">
                    查看
                  </Link>
                )}
              </div>
            </div>

            <div className="lg:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[oklch(0.9_0.03_228)] bg-[oklch(0.995_0.012_230/.95)] text-[var(--color-sky-strong)]">
                      {iconForType(resource.mime_type)}
                    </div>
                    <p className="truncate font-medium text-[var(--color-ink-strong)]">
                      {resource.original_filename}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                    {resource.description}
                  </p>
                </div>
                <div className="shrink-0">
                  {renderActions ? (
                    <div className="flex flex-col items-end gap-2">{renderActions(resource)}</div>
                  ) : (
                    <Link to={`/resources/${resource.id}`} className="admin-secondary-btn shrink-0">
                      查看
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-[var(--color-ink)]">
                <UploaderCell resource={resource} />
                <div className="flex items-center gap-2">
                  <Download size={14} />
                  {resource.download_count} 次
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  {formatFileSize(resource.file_size)}
                </div>
                <div className="text-right text-xs text-[var(--color-ink-soft)]">
                  {formatDate(resource.created_at)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {summary && pagination && pagination.total > 0 ? (
        <div className="flex flex-col gap-3 border-t border-[oklch(0.92_0.02_230)] bg-[oklch(0.995_0.012_230/.92)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-col gap-3 text-sm text-[var(--color-ink-soft)] md:flex-row md:items-center">
            <span>
              {summary.currentPage} / {summary.totalPages} 页，共 {pagination.total} 条
            </span>
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">每页</span>
              <Select
                data={[
                  { value: "10", label: "10 条" },
                  { value: "20", label: "20 条" },
                  { value: "50", label: "50 条" },
                ]}
                value={String(pagination.page_size)}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }
                  onPageSizeChange?.(Number(value));
                }}
                disabled={loading}
                radius="xl"
                w={110}
                allowDeselect={false}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="admin-secondary-btn"
              onClick={() => onPageChange?.(summary.currentPage - 1)}
              disabled={!summary.hasPreviousPage || loading}
            >
              上一页
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {pageItems.map((item, index) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 text-sm text-[var(--color-ink-soft)]"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    type="button"
                    variant={item === summary.currentPage ? "default" : "outline"}
                    className={
                      item === summary.currentPage
                        ? "admin-primary-btn min-w-10"
                        : "admin-secondary-btn min-w-10"
                    }
                    onClick={() => onPageChange?.(item)}
                    disabled={loading}
                  >
                    {item}
                  </Button>
                ),
              )}
            </div>
            <div className="flex items-center gap-2">
              <TextInput
                value={jumpPage}
                onChange={(event) => setJumpPage(event.currentTarget.value)}
                onBlur={handleJump}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleJump();
                  }
                }}
                disabled={loading}
                radius="xl"
                w={84}
                placeholder="页码"
              />
              <Button
                type="button"
                variant="outline"
                className="admin-secondary-btn"
                onClick={handleJump}
                disabled={loading}
              >
                跳转
              </Button>
            </div>
            <Button
              type="button"
              className="admin-primary-btn"
              onClick={() => onPageChange?.(summary.currentPage + 1)}
              disabled={!summary.hasNextPage || loading}
            >
              下一页
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
