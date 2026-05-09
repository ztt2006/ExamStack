import { Alert, FileInput, Modal, TextInput, Textarea } from "@mantine/core";
import { useDebounce, useRequest } from "ahooks";
import { AlertCircle, Plus, Search, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

import { getResources, uploadResource } from "@/api/resources";
import { ResourceTable } from "@/components/resource/resource-table";
import { Button } from "@/components/ui/button";

export function DocumentsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadOpened, setUploadOpened] = useState(false);
  const debouncedKeyword = useDebounce(keyword, { wait: 250 });

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const resourcesRequest = useRequest(
    () =>
      getResources({
        keyword: debouncedKeyword || undefined,
        page,
        page_size: pageSize,
      }),
    {
      refreshDeps: [debouncedKeyword, page, pageSize],
    },
  );

  const uploadRequest = useRequest(
    async () => {
      if (!file) {
        setErrorMessage("请先选择一个文件。");
        return;
      }
      setErrorMessage("");
      await uploadResource({
        description,
        file,
      });
      setDescription("");
      setFile(null);
      setUploadOpened(false);
      setPage(1);
      await resourcesRequest.refresh();
    },
    {
      manual: true,
    },
  );

  return (
    <div className="space-y-6">
      <section className="panel-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="section-title text-[2rem]">资料</h2>
          <Button
            type="button"
            size="lg"
            className="admin-primary-btn justify-center"
            onClick={() => setUploadOpened(true)}
          >
            <Plus />
            上传文档
          </Button>
        </div>
      </section>

      <section className="panel-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-[var(--color-sky-strong)] text-sm font-medium">
            <Search size={16} />
            搜索
          </div>
          <div className="w-full md:max-w-md">
            <TextInput
              value={keyword}
              onChange={(event) => setKeyword(event.currentTarget.value)}
              placeholder="按描述或文件名搜索"
              radius="xl"
            />
          </div>
        </div>
      </section>

      {resourcesRequest.error ? (
        <Alert
          icon={<AlertCircle size={16} />}
          radius="xl"
          color="red"
          title="资料列表加载失败"
        >
          请确认后端服务已启动，并且数据库迁移已经执行完成。
        </Alert>
      ) : null}

      <ResourceTable
        items={resourcesRequest.data?.items ?? []}
        pagination={resourcesRequest.data?.pagination}
        loading={resourcesRequest.loading}
        onPageChange={setPage}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
      />

      <Modal
        opened={uploadOpened}
        onClose={() => setUploadOpened(false)}
        title="上传文档"
        centered
        radius="xl"
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void uploadRequest.run();
          }}
        >
          <Textarea
            label="描述"
            placeholder="写一句清楚的描述，方便后续搜索和辨认"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            radius="xl"
            minRows={4}
            required
          />
          <FileInput
            label="文件"
            placeholder="选择一个文档、PDF 或图片"
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
              title="上传失败"
            >
              {errorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={uploadRequest.loading}
          >
            <UploadCloud />
            {uploadRequest.loading ? "正在上传..." : "提交文档"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
