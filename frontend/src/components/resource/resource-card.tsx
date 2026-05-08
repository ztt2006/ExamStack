import { Badge } from "@mantine/core";
import { Download, Eye, FileText, ImageIcon, NotebookTabs, Sparkles } from "lucide-react";
import { Link } from "react-router";

import type { Resource } from "@/types";
import { formatDate, formatFileSize, getResourceTone } from "@/utils/resource";

function iconForType(type: string) {
  if (type === "pdf") {
    return <FileText size={18} />;
  }
  if (type === "image") {
    return <ImageIcon size={18} />;
  }
  return <NotebookTabs size={18} />;
}

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="panel-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.96_0.01_255)] text-[oklch(0.32_0.01_255)]">
            {iconForType(resource.resource_type)}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[oklch(0.5_0.01_255)]">
              {getResourceTone(resource.resource_type)}
            </p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-[oklch(0.18_0.01_255)]">
              {resource.title}
            </h3>
          </div>
        </div>
        <Badge
          radius="sm"
          variant="light"
          color="gray"
          className="!bg-[oklch(0.96_0.01_255)] !text-[oklch(0.42_0.01_255)]"
        >
          {resource.subject_name}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[oklch(0.42_0.01_255)]">
        {resource.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {resource.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[oklch(0.96_0.01_255)] px-2.5 py-1 text-xs text-[oklch(0.42_0.01_255)]"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[oklch(0.42_0.01_255)] md:grid-cols-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} />
          <span>{resource.term}</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText size={16} />
          <span>{formatFileSize(resource.file_size)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span>{resource.uploader_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Download size={16} />
          <span>{resource.download_count} 次下载</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[oklch(0.93_0.01_255)] pt-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-[oklch(0.52_0.01_255)]">
            最近共享
          </p>
          <p className="mt-1 text-sm text-[oklch(0.3_0.01_255)]">
            {formatDate(resource.created_at)}
          </p>
        </div>
        <Link
          to={`/resources/${resource.id}`}
          className="admin-primary-btn"
        >
          查看详情
        </Link>
      </div>
    </article>
  );
}
