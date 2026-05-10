import { Alert, FileInput, Modal, Progress, Select, TextInput, Textarea } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, FileUp, Gauge, Plus, Shapes, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { createSubject, getSubjects } from "@/api/subjects";
import {
  getMaxUploadSize,
  getUploadChunkSize,
  shouldUseChunkedUpload,
  uploadResource,
  type UploadProgress,
} from "@/api/resources";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/resource";

const maxUploadSize = getMaxUploadSize();
const uploadChunkSize = getUploadChunkSize();

export function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState("");
  const [resourceType, setResourceType] = useState("document");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [subjectModalOpened, setSubjectModalOpened] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newSubjectCategory, setNewSubjectCategory] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [subjectErrorMessage, setSubjectErrorMessage] = useState("");

  const subjectsRequest = useRequest(getSubjects);

  const subjectOptions = useMemo(
    () =>
      (subjectsRequest.data ?? []).map((subject) => ({
        value: String(subject.id),
        label: `${subject.name} · ${subject.code}`,
      })),
    [subjectsRequest.data],
  );

  const uploadRequest = useRequest(
    async () => {
      if (!file || !subjectId) {
        setErrorMessage("请先选择科目并上传文件。");
        return;
      }
      if (file.size > maxUploadSize) {
        setErrorMessage("文件不能超过 50MB。");
        return;
      }
      setErrorMessage("");
      setUploadProgress(null);
      const resource = await uploadResource({
        description,
        file,
        onProgress: setUploadProgress,
      });
      await navigate(`/resources/${resource.id}`);
    },
    {
      manual: true,
    },
  );
  const selectedFileUsesChunks = file ? shouldUseChunkedUpload(file) : false;

  const createSubjectRequest = useRequest(
    async () => {
      setSubjectErrorMessage("");
      const subject = await createSubject({
        name: newSubjectName,
        code: newSubjectCode,
        category: newSubjectCategory,
        description: newSubjectDescription || undefined,
      });
      await subjectsRequest.refresh();
      setSubjectId(String(subject.id));
      setSubjectModalOpened(false);
      setNewSubjectName("");
      setNewSubjectCode("");
      setNewSubjectCategory("");
      setNewSubjectDescription("");
      return subject;
    },
    {
      manual: true,
      onError: (error) => {
        setSubjectErrorMessage(
          error instanceof Error ? error.message : "创建科目失败，请稍后再试。",
        );
      },
    },
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-4">
        <div className="panel-card hero-panel p-6">
          <div className="section-badge">Upload</div>
          <h1 className="section-title mt-3 text-[2.25rem]">
            把你手里的资料
            统一录入平台
          </h1>
          <p className="page-copy mt-4">
            支持新增 PDF、图片和文档资料。提交后资料会进入共享列表，并自动获得积分奖励。
          </p>
        </div>

        <div className="panel-card p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-card">
              <p className="metric-label">
                支持格式
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">PDF / 图片 / 文档</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                单次收益
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">+5 积分</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                社区曝光
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink-strong)]">即时进入广场</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card p-6 sm:p-8">
        <div className="section-badge mb-5">Publish Resource</div>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void uploadRequest.run();
          }}
        >
          <TextInput
            label="资料标题"
            placeholder="例如：数据结构期末重点整理"
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            radius="md"
            required
          />
          <Textarea
            label="资料说明"
            placeholder="写一下内容范围、适合人群、是否包含答案或复习建议"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            radius="md"
            minRows={4}
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-[var(--color-ink-strong)]">
                  所属科目
                </label>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-sky-strong)]"
                  onClick={() => setSubjectModalOpened(true)}
                >
                  <Plus size={14} />
                  新建科目
                </button>
              </div>
              <Select
                placeholder={
                  subjectsRequest.loading ? "正在加载科目..." : "选择科目"
                }
                value={subjectId}
                onChange={(value) => setSubjectId(value ?? "")}
                data={subjectOptions}
                radius="md"
                searchable
                nothingFoundMessage="没有可用科目，先新建一个"
                disabled={subjectsRequest.loading}
                required
              />
              <p className="text-xs text-[var(--color-ink-soft)]">
                如果列表为空，可以先新建科目，再继续上传资料。
              </p>
            </div>
            <TextInput
              label="学期"
              placeholder="例如：2026 Spring"
              value={term}
              onChange={(event) => setTerm(event.currentTarget.value)}
              radius="md"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="资料类型"
              value={resourceType}
              onChange={(value) => setResourceType(value ?? "document")}
              data={[
                { value: "document", label: "整理文档" },
                { value: "pdf", label: "试题 PDF" },
                { value: "image", label: "图片资料" },
              ]}
              radius="md"
              required
            />
            <TextInput
              label="标签"
              placeholder="例如：期末,重点,速背"
              value={tags}
              onChange={(event) => setTags(event.currentTarget.value)}
              radius="md"
            />
          </div>
          <FileInput
            label="上传文件"
            placeholder="拖入或选择一个文件"
            value={file}
            onChange={(nextFile) => {
              setFile(nextFile);
              setUploadProgress(null);
              setErrorMessage("");
            }}
            radius="md"
            leftSection={<FileUp size={16} />}
            clearable
            required
          />
          {file ? (
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink-strong)]">{file.name}</p>
                  <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
                    {formatFileSize(file.size)} · 最大 {formatFileSize(maxUploadSize)} ·
                    {selectedFileUsesChunks
                      ? ` 将按 ${formatFileSize(uploadChunkSize)} 分片断点续传`
                      : " 将使用快速上传"}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {uploadProgress ? (
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-ink-strong)]">
                  <Gauge size={16} />
                  上传进度
                </p>
                <p className="text-sm font-bold text-[var(--color-sky-strong)]">{uploadProgress.percent}%</p>
              </div>
              <Progress value={uploadProgress.percent} radius="xl" color="sky" size="md" className="mt-3" />
            </div>
          ) : null}

          {errorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="提交失败"
            >
              {errorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn mt-2 w-full justify-center"
            disabled={uploadRequest.loading}
          >
            <UploadCloud />
            {uploadRequest.loading ? "正在上传..." : "发布到资料广场"}
          </Button>
        </form>
      </section>

      <Modal
        opened={subjectModalOpened}
        onClose={() => setSubjectModalOpened(false)}
        title="新建科目"
        centered
        radius="md"
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void createSubjectRequest.run();
          }}
        >
          <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-soft)] p-4">
            <div className="flex items-start gap-3">
              <div className="metric-icon h-10 w-10">
                <Shapes size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink-strong)]">
                  让上传流程不断线
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
                  创建成功后会自动刷新科目列表，并直接帮你选中新科目。
                </p>
              </div>
            </div>
          </div>

          <TextInput
            label="科目名称"
            placeholder="例如：数据结构"
            value={newSubjectName}
            onChange={(event) => setNewSubjectName(event.currentTarget.value)}
            radius="md"
            required
          />
          <TextInput
            label="科目代码"
            placeholder="例如：CS202"
            value={newSubjectCode}
            onChange={(event) => setNewSubjectCode(event.currentTarget.value)}
            radius="md"
            required
          />
          <TextInput
            label="科目分类"
            placeholder="例如：计算机"
            value={newSubjectCategory}
            onChange={(event) => setNewSubjectCategory(event.currentTarget.value)}
            radius="md"
            required
          />
          <Textarea
            label="科目说明"
            placeholder="可选，补充这个科目的资料范围或说明"
            value={newSubjectDescription}
            onChange={(event) => setNewSubjectDescription(event.currentTarget.value)}
            radius="md"
            minRows={3}
          />

          {subjectErrorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="创建科目失败"
            >
              {subjectErrorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={createSubjectRequest.loading}
          >
            <Plus />
            {createSubjectRequest.loading ? "正在创建..." : "创建并选中科目"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
