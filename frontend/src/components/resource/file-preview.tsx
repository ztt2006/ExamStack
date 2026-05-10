import { Download, Eye, LoaderCircle, RadioTower } from "lucide-react";
import { useState } from "react";

import { downloadResource } from "@/api/resources";
import type { Resource } from "@/types";
import { resolveBackendUrl } from "@/utils/resource";

interface FilePreviewProps {
  resource: Resource;
  onDownloaded?: (resource: Resource) => void;
}

export function FilePreview({ resource, onDownloaded }: FilePreviewProps) {
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewErrorMessage, setPreviewErrorMessage] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadErrorMessage, setDownloadErrorMessage] = useState("");
  const previewUrl = `${resolveBackendUrl(resource.preview_url)}?v=${resource.id}-${resource.file_size}`;
  const isDocx =
    resource.mime_type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    resource.original_filename.toLowerCase().endsWith(".docx");
  const handleDownload = async () => {
    try {
      setDownloadLoading(true);
      setDownloadErrorMessage("");
      const action = await downloadResource(resource.id);
      onDownloaded?.({
        ...resource,
        download_count: resource.download_count + 1,
      });
      window.open(resolveBackendUrl(action.download_url), "_blank", "noopener,noreferrer");
    } catch (error) {
      setDownloadErrorMessage(error instanceof Error ? error.message : "下载失败，请稍后再试。");
    } finally {
      setDownloadLoading(false);
    }
  };
  const downloadButton = (
    <button
      type="button"
      className="admin-primary-btn inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => void handleDownload()}
      disabled={downloadLoading}
    >
      {downloadLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
      {downloadLoading ? "正在处理..." : "下载文件"}
    </button>
  );

  if (resource.mime_type.startsWith("image/")) {
    return (
      <div className="panel-card overflow-hidden p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3">
          <span className="text-sm text-[var(--color-ink-soft)]">
            下载次数：{resource.download_count}
          </span>
          {downloadButton}
        </div>
        {downloadErrorMessage ? (
          <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {downloadErrorMessage}
          </p>
        ) : null}
        {previewErrorMessage ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-red-600">{previewErrorMessage}</p>
            <p className="mt-2 text-sm text-red-500">
              可能是图片文件损坏、后端文件缺失，或浏览器无法解析该图片格式。
            </p>
            <div className="mt-4">{downloadButton}</div>
          </div>
        ) : null}
        {previewLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink-soft)]">
            <LoaderCircle size={16} className="animate-spin" />
            正在加载预览
          </div>
        ) : null}
        {!previewErrorMessage ? (
          <img
            src={previewUrl}
            alt={resource.original_filename}
            loading="eager"
            onLoad={() => {
              setPreviewLoading(false);
              setPreviewErrorMessage("");
            }}
            onError={() => {
              setPreviewLoading(false);
              setPreviewErrorMessage("图片预览加载失败");
            }}
            className={`h-auto max-h-[68dvh] w-full rounded-lg object-contain ${previewLoading ? "hidden" : ""}`}
          />
        ) : null}
      </div>
    );
  }

  if (resource.mime_type.includes("pdf") || isDocx) {
    return (
      <div className="panel-card overflow-hidden p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
          <div className="grid gap-1">
            {!isDocx ? (
              <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-ink-strong)]">
                <RadioTower size={16} className="text-[var(--color-sky-strong)]" />
                正在使用流式预览
              </span>
            ) : (
              <span className="font-semibold text-[var(--color-ink-strong)]">文档预览</span>
            )}
            <span>
              {!isDocx ? "打开即预览，滚动时继续按需加载。" : "可在线预览，也可以下载到本地查看。"}
              下载次数：{resource.download_count}
            </span>
          </div>
          {downloadButton}
        </div>
        {downloadErrorMessage ? (
          <p className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {downloadErrorMessage}
          </p>
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
          className="h-[78dvh] min-h-[720px] w-full rounded-lg bg-white"
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
        <div className="mt-6">{downloadButton}</div>
        {downloadErrorMessage ? (
          <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {downloadErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
