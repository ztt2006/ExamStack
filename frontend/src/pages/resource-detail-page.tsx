import { Alert, Loader } from "@mantine/core";
import { useRequest } from "ahooks";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

import { downloadResource, getResourceDetail } from "@/api/resources";
import { getCurrentUser } from "@/api/auth";
import { FilePreview } from "@/components/resource/file-preview";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { formatDate, formatFileSize, resolveBackendUrl } from "@/utils/resource";

export function ResourceDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { token, setUser } = useAuthStore();

  const detailRequest = useRequest(() => getResourceDetail(id), {
    refreshDeps: [id],
  });

  const downloadRequest = useRequest(
    async () => {
      if (!token) {
        await navigate("/login", { state: { from: `/resources/${id}` } });
        return;
      }
      const payload = await downloadResource(Number(id));
      const latestUser = await getCurrentUser();
      setUser(latestUser);
      window.open(resolveBackendUrl(payload.download_url), "_blank", "noopener,noreferrer");
    },
    {
      manual: true,
    },
  );

  if (detailRequest.loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader color="orange" />
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

  const resource = detailRequest.data;

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-[oklch(0.44_0.01_255)]"
      >
        <ArrowLeft size={16} />
        返回资料广场
      </Link>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <div className="panel-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[oklch(0.96_0.01_255)] px-3 py-1 text-xs text-[oklch(0.42_0.01_255)]">
                {resource.subject_name}
              </span>
              <span className="rounded-md bg-[oklch(0.96_0.01_255)] px-3 py-1 text-xs text-[oklch(0.42_0.01_255)]">
                {resource.resource_type}
              </span>
            </div>
            <h1 className="mt-4 font-heading text-3xl font-semibold text-[oklch(0.18_0.01_255)]">
              {resource.title}
            </h1>
            <p className="mt-4 max-w-[70ch] text-sm leading-7 text-[oklch(0.44_0.01_255)]">
              {resource.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[oklch(0.96_0.01_255)] px-3 py-1 text-xs text-[oklch(0.42_0.01_255)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <FilePreview resource={resource} />
        </div>

        <aside className="space-y-4">
          <div className="panel-card p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[oklch(0.52_0.01_255)]">
              Detail Board
            </p>
            <div className="mt-5 grid gap-4">
              <div className="detail-row">
                <GraduationCap size={16} />
                <span>{resource.subject_name}</span>
              </div>
              <div className="detail-row">
                <Sparkles size={16} />
                <span>{resource.term}</span>
              </div>
              <div className="detail-row">
                <FileText size={16} />
                <span>{formatFileSize(resource.file_size)}</span>
              </div>
              <div className="detail-row">
                <Eye size={16} />
                <span>{resource.uploader_name}</span>
              </div>
              <div className="detail-row">
                <Download size={16} />
                <span>{resource.download_count} 次下载</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-[oklch(0.44_0.01_255)]">
              发布时间：{formatDate(resource.created_at)}
            </p>
            <Button
              size="lg"
              className="admin-primary-btn mt-6 w-full justify-center"
              onClick={() => void downloadRequest.run()}
              disabled={downloadRequest.loading}
            >
              <Download />
              {downloadRequest.loading ? "正在扣积分并打开..." : "下载资料（-5 积分）"}
            </Button>
            {!token ? (
              <p className="mt-3 text-sm leading-7 text-[oklch(0.44_0.01_255)]">
                未登录时也能看详情，但下载会先跳转登录。
              </p>
            ) : null}
          </div>

          <div className="panel-card p-6">
            <h2 className="font-heading text-2xl font-semibold text-[oklch(0.18_0.01_255)]">
              下载前提醒
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-[oklch(0.44_0.01_255)]">
              <p>1. 每次下载会扣除 5 积分。</p>
              <p>2. 上传一份新资料可立即获得 5 积分。</p>
              <p>3. 图片与 PDF 可直接在线预览，其他文档建议下载后查看。</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
