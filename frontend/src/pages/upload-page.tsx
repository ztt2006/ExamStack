import { Alert, FileInput, Select, TextInput, Textarea } from "@mantine/core";
import { useRequest } from "ahooks";
import { AlertCircle, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { getSubjects } from "@/api/subjects";
import { uploadResource } from "@/api/resources";
import { Button } from "@/components/ui/button";

export function UploadPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [term, setTerm] = useState("");
  const [resourceType, setResourceType] = useState("document");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
      setErrorMessage("");
      const resource = await uploadResource({
        title,
        description,
        subject_id: Number(subjectId),
        term,
        resource_type: resourceType,
        tags,
        file,
      });
      await navigate(`/resources/${resource.id}`);
    },
    {
      manual: true,
    },
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-4">
        <div className="panel-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[oklch(0.52_0.01_255)]">
            Upload Mission
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-[oklch(0.18_0.01_255)]">
            把你手里的资料
            统一录入平台
          </h1>
          <p className="mt-4 text-sm leading-7 text-[oklch(0.44_0.01_255)]">
            支持新增 PDF、图片和文档资料。提交后资料会进入共享列表，并自动获得积分奖励。
          </p>
        </div>

        <div className="panel-card p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-card">
              <p className="metric-label">
                支持格式
              </p>
              <p className="mt-2 text-sm font-semibold text-[oklch(0.18_0.01_255)]">PDF / 图片 / 文档</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                单次收益
              </p>
              <p className="mt-2 text-sm font-semibold text-[oklch(0.18_0.01_255)]">+5 积分</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">
                社区曝光
              </p>
              <p className="mt-2 text-sm font-semibold text-[oklch(0.18_0.01_255)]">即时进入广场</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel-card p-6 sm:p-8">
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
            radius="xl"
            required
          />
          <Textarea
            label="资料说明"
            placeholder="写一下内容范围、适合人群、是否包含答案或复习建议"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            radius="xl"
            minRows={4}
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="所属科目"
              placeholder="选择科目"
              value={subjectId}
              onChange={(value) => setSubjectId(value ?? "")}
              data={subjectOptions}
              radius="xl"
              searchable
              required
            />
            <TextInput
              label="学期"
              placeholder="例如：2026 Spring"
              value={term}
              onChange={(event) => setTerm(event.currentTarget.value)}
              radius="xl"
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
              radius="xl"
              required
            />
            <TextInput
              label="标签"
              placeholder="例如：期末,重点,速背"
              value={tags}
              onChange={(event) => setTags(event.currentTarget.value)}
              radius="xl"
            />
          </div>
          <FileInput
            label="上传文件"
            placeholder="拖入或选择一个文件"
            value={file}
            onChange={setFile}
            radius="xl"
            clearable
            required
          />

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
    </div>
  );
}
