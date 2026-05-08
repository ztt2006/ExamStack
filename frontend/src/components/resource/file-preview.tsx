import { Download, Eye } from "lucide-react";

import type { Resource } from "@/types";
import { resolveBackendUrl } from "@/utils/resource";

interface FilePreviewProps {
  resource: Resource;
}

export function FilePreview({ resource }: FilePreviewProps) {
  const previewUrl = resolveBackendUrl(resource.preview_url);
  const fileUrl = resolveBackendUrl(resource.download_url);

  if (resource.mime_type.startsWith("image/")) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-[oklch(0.87_0.03_82)] bg-[oklch(0.98_0.02_95)] p-4 shadow-[0_18px_50px_-36px_oklch(0.32_0.08_40/.55)]">
        <img
          src={previewUrl}
          alt={resource.title}
          className="h-auto max-h-[68dvh] w-full rounded-[1.5rem] object-contain"
        />
      </div>
    );
  }

  if (resource.mime_type.includes("pdf")) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-[oklch(0.87_0.03_82)] bg-[oklch(0.98_0.02_95)] p-4 shadow-[0_18px_50px_-36px_oklch(0.32_0.08_40/.55)]">
        <iframe
          src={previewUrl}
          title={resource.title}
          className="h-[68dvh] w-full rounded-[1.4rem] bg-white"
        />
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[oklch(0.87_0.03_82)] bg-[oklch(0.98_0.02_95)] p-8 shadow-[0_18px_50px_-36px_oklch(0.32_0.08_40/.55)]">
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[oklch(0.9_0.08_75)] text-[oklch(0.42_0.11_45)]">
          <Eye size={24} />
        </div>
        <h3 className="mt-5 font-heading text-2xl font-bold text-[oklch(0.24_0.05_255)]">
          该文档适合直接下载查看
        </h3>
        <p className="mt-3 text-sm leading-7 text-[oklch(0.42_0.03_250)]">
          当前浏览器内预览体验有限，但资料已经准备好。你可以直接下载到本地继续复习。
        </p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[oklch(0.27_0.06_250)] px-5 py-3 text-sm font-semibold text-[oklch(0.98_0.02_95)]"
        >
          <Download size={16} />
          打开文件
        </a>
      </div>
    </div>
  );
}
