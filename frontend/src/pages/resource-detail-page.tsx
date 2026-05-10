import { Alert, Loader } from "@mantine/core";
import { useRequest } from "ahooks";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { useState } from "react";

import { getResourceDetail } from "@/api/resources";
import { FilePreview } from "@/components/resource/file-preview";
import { formatDate, formatFileSize } from "@/utils/resource";

export function ResourceDetailPage() {
  const { id = "" } = useParams();
  const [downloadCountOverride, setDownloadCountOverride] = useState<number | null>(null);

  const detailRequest = useRequest(() => getResourceDetail(id), {
    refreshDeps: [id],
    onSuccess: () => setDownloadCountOverride(null),
  });

  if (detailRequest.loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader color="sky" />
      </div>
    );
  }

  if (detailRequest.error || !detailRequest.data) {
    return (
      <Alert
        icon={<AlertCircle size={16} />}
        radius="xl"
        color="red"
        title="资料详情加载失败"
      >
        该资料可能不存在，或者后端服务尚未启动。
      </Alert>
    );
  }

  const resource = {
    ...detailRequest.data,
    download_count: downloadCountOverride ?? detailRequest.data.download_count,
  };

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)]"
      >
        <ArrowLeft size={16} />
        返回
      </Link>

      <section className="space-y-6">
        <div className="panel-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-2">
              <FileText size={15} />
              {resource.original_filename}
            </span>
            <span>{formatFileSize(resource.file_size)}</span>
            <span>{resource.uploader_name}</span>
            <span>下载 {resource.download_count} 次</span>
            <span>{formatDate(resource.created_at)}</span>
          </div>
          {resource.description ? (
            <p className="page-copy mt-4 max-w-[78ch]">{resource.description}</p>
          ) : null}
        </div>

        <FilePreview
          resource={resource}
          onDownloaded={(nextResource) => setDownloadCountOverride(nextResource.download_count)}
        />
      </section>
    </div>
  );
}
