import { Download, Eye, LoaderCircle, RadioTower } from "lucide-react";
import { useState } from "react";

import type { Resource } from "@/types";
import { resolveBackendUrl } from "@/utils/resource";

interface FilePreviewProps {
  resource: Resource;
}

export function FilePreview({ resource }: FilePreviewProps) {
  const [previewLoading, setPreviewLoading] = useState(true);
  const previewUrl = resolveBackendUrl(resource.preview_url);
  const fileUrl = resolveBackendUrl(resource.download_url);
  const isDocx =
    resource.mime_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    resource.original_filename.toLowerCase().endsWith(".docx");

  if (resource.mime_type.startsWith("image/")) {
    return (
      <div className="panel-card overflow-hidden p-4">
        {previewLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink-soft)]">
            <LoaderCircle size={16} className="animate-spin" />
            正在加载预览
          </div>
        ) : null}
        <img
          src={previewUrl}
          alt={resource.original_filename}
          loading="lazy"
          onLoad={() => setPreviewLoading(false)}
          className={`h-auto max-h-[68dvh] w-full rounded-[1.35rem] object-contain ${previewLoading ? "hidden" : ""}`}
        />
      </div>
    );
  }

  if (resource.mime_type.includes("pdf") || isDocx) {
    return (
      <div className="panel-card overflow-hidden p-4">
        {!isDocx ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-[oklch(0.9_0.03_230)] bg-white/75 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-ink-strong)]">
              <RadioTower size={16} className="text-[var(--color-sky-strong)]" />
              正在使用流式预览
            </span>
            <span>打开即预览，滚动时继续按需加载。</span>
          </div>
        ) : null}
        {previewLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink-soft)]">
            <LoaderCircle size={16} className="animate-spin" />
            正在建立预览流
          </div>
        ) : null}
        <iframe
          src={previewUrl}
          title={resource.original_filename}
          onLoad={() => setPreviewLoading(false)}
          className="h-[78dvh] min-h-[720px] w-full rounded-[1.35rem] bg-white"
        />
      </div>
    );
  }

  return (
    <div className="panel-card p-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="metric-icon mx-auto h-14 w-14">
          <Eye size={24} />
        </div>
        <h3 className="section-title mt-5 text-center text-[2rem]">
          该文档适合直接下载查看
        </h3>
        <p className="page-copy mt-3">
          当前仅支持图片、PDF 和 DOCX 在线预览。其他格式建议下载后使用本地软件打开。
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="admin-primary-btn mt-6 inline-flex items-center gap-2"
        >
          <Download size={16} />
          打开文件
        </a>
      </div>
    </div>
  );
}
