import { Alert, FileInput, Loader, Modal, TextInput, Textarea } from "@mantine/core";
import { useDebounce, useRequest } from "ahooks";
import { AlertCircle, Pencil, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { uploadResource } from "@/api/resources";
import {
  deleteMyResource,
  getMyResourceDetail,
  getMyResources,
  updateMyResource,
} from "@/api/users";
import { EmptyState } from "@/components/common/empty-state";
import { ResourceTable } from "@/components/resource/resource-table";
import { Button } from "@/components/ui/button";
import type { Resource } from "@/types";

export function ProfilePage() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [uploadOpened, setUploadOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState("");
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const debouncedKeyword = useDebounce(keyword, { wait: 250 });

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  const myResourcesRequest = useRequest(
    () =>
      getMyResources({
        keyword: debouncedKeyword || undefined,
        page,
        pageSize,
      }),
    {
      refreshDeps: [debouncedKeyword, page, pageSize],
    },
  );

  const refreshData = async () => {
    await myResourcesRequest.refresh();
  };

  const uploadRequest = useRequest(
    async () => {
      if (!uploadFile) {
        setUploadErrorMessage("请先选择一个文件。");
        return;
      }
      setUploadErrorMessage("");
      await uploadResource({
        description: uploadDescription,
        file: uploadFile,
      });
      setUploadDescription("");
      setUploadFile(null);
      setUploadOpened(false);
      setPage(1);
      await refreshData();
    },
    {
      manual: true,
      onError: (error) => {
        setUploadErrorMessage(error instanceof Error ? error.message : "上传失败，请稍后再试。");
      },
    },
  );

  const editRequest = useRequest(
    async () => {
      if (!selectedResource) {
        return;
      }
      setEditErrorMessage("");
      await updateMyResource(selectedResource.id, {
        description: editDescription,
        file: editFile,
      });
      setEditFile(null);
      setSelectedResource(null);
      setEditOpened(false);
      await refreshData();
    },
    {
      manual: true,
      onError: (error) => {
        setEditErrorMessage(error instanceof Error ? error.message : "更新失败，请稍后再试。");
      },
    },
  );

  const deleteRequest = useRequest(
    async () => {
      if (!selectedResource) {
        return;
      }
      setDeleteErrorMessage("");
      await deleteMyResource(selectedResource.id);
      setSelectedResource(null);
      setDeleteOpened(false);
      if ((myResourcesRequest.data?.items.length ?? 0) <= 1 && page > 1) {
        setPage((current) => current - 1);
      }
      await refreshData();
    },
    {
      manual: true,
      onError: (error) => {
        setDeleteErrorMessage(error instanceof Error ? error.message : "删除失败，请稍后再试。");
      },
    },
  );

  const detailRequest = useRequest(
    async (resourceId: number) => getMyResourceDetail(resourceId),
    {
      manual: true,
      onSuccess: (resource) => {
        setSelectedResource(resource);
        setEditDescription(resource.description);
        setEditFile(null);
        setEditErrorMessage("");
        setEditOpened(true);
      },
      onError: (error) => {
        setEditErrorMessage(error instanceof Error ? error.message : "加载文档详情失败。");
      },
    },
  );

  const myItems = myResourcesRequest.data?.items ?? [];

  const openEditModal = (resource: Resource) => {
    void detailRequest.run(resource.id);
  };

  const openDeleteModal = (resource: Resource) => {
    setSelectedResource(resource);
    setDeleteErrorMessage("");
    setDeleteOpened(true);
  };

  return (
    <div className="space-y-8">
      <section className="panel-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
              My Uploads
            </p>
            <h2 className="section-title mt-2">我的上传</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-full sm:w-72">
              <TextInput
                value={keyword}
                onChange={(event) => setKeyword(event.currentTarget.value)}
                placeholder="按描述或文件名搜索"
                radius="xl"
                leftSection={<Search size={16} />}
              />
            </div>
            <Button
              type="button"
              size="lg"
              className="admin-primary-btn justify-center"
              onClick={() => {
                setUploadDescription("");
                setUploadFile(null);
                setUploadErrorMessage("");
                setUploadOpened(true);
              }}
            >
              <Plus />
              新增上传
            </Button>
          </div>
        </div>
      </section>

      {myResourcesRequest.loading && myItems.length === 0 ? (
        <div className="flex min-h-[30dvh] items-center justify-center">
          <Loader color="sky" />
        </div>
      ) : null}

      {myResourcesRequest.error ? (
        <Alert
          icon={<AlertCircle size={16} />}
          radius="xl"
          color="red"
          title="我的上传加载失败"
        >
          请确认后端服务可用，再刷新页面重试。
        </Alert>
      ) : null}

      {myItems.length === 0 && !myResourcesRequest.loading ? (
        <EmptyState
          title="你还没有上传任何资料"
          description="你的整理内容、复习提纲和往年题都可以直接发到广场。第一份上传，就能先把积分赚回来。"
          action={
            <Button
              type="button"
              className="admin-primary-btn"
              onClick={() => setUploadOpened(true)}
            >
              <UploadCloud />
              立即上传
            </Button>
          }
        />
      ) : (
        <ResourceTable
          items={myItems}
          pagination={myResourcesRequest.data?.pagination}
          loading={myResourcesRequest.loading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
          renderActions={(resource) => (
            <>
              <Link
                to={`/resources/${resource.id}`}
                className="admin-secondary-btn min-w-[68px] text-center"
              >
                查看
              </Link>
              <button
                type="button"
                className="admin-secondary-btn inline-flex min-w-[68px] items-center justify-center gap-2"
                onClick={() => openEditModal(resource)}
                disabled={detailRequest.loading}
              >
                <Pencil size={14} />
                编辑
              </button>
              <button
                type="button"
                className="admin-secondary-btn inline-flex min-w-[68px] items-center justify-center gap-2 text-red-600"
                onClick={() => openDeleteModal(resource)}
              >
                <Trash2 size={14} />
                删除
              </button>
            </>
          )}
        />
      )}

      <Modal
        opened={uploadOpened}
        onClose={() => setUploadOpened(false)}
        title="新增上传"
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
            label="资料说明"
            placeholder="写一句清楚的描述，方便后续搜索和辨认"
            value={uploadDescription}
            onChange={(event) => setUploadDescription(event.currentTarget.value)}
            radius="xl"
            minRows={4}
            required
          />
          <FileInput
            label="文件"
            placeholder="选择一个文档、PDF 或图片"
            value={uploadFile}
            onChange={setUploadFile}
            radius="xl"
            clearable
            required
          />

          {uploadErrorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="上传失败"
            >
              {uploadErrorMessage}
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

      <Modal
        opened={editOpened}
        onClose={() => {
          setEditOpened(false);
          setSelectedResource(null);
        }}
        title="编辑我的上传"
        centered
        radius="xl"
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void editRequest.run();
          }}
        >
          <Textarea
            label="资料说明"
            placeholder="更新这份资料的说明"
            value={editDescription}
            onChange={(event) => setEditDescription(event.currentTarget.value)}
            radius="xl"
            minRows={4}
            required
          />
          <FileInput
            label="替换文件"
            placeholder="可选，不替换就保留原文件"
            value={editFile}
            onChange={setEditFile}
            radius="xl"
            clearable
          />

          {selectedResource ? (
            <div className="rounded-[1rem] border border-[oklch(0.9_0.03_230)] bg-[oklch(0.995_0.012_232/.92)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
              当前文件：{selectedResource.original_filename}
            </div>
          ) : null}

          {editErrorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="更新失败"
            >
              {editErrorMessage}
            </Alert>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="admin-primary-btn w-full justify-center"
            disabled={editRequest.loading || detailRequest.loading}
          >
            <Pencil />
            {editRequest.loading ? "正在保存..." : "保存修改"}
          </Button>
        </form>
      </Modal>

      <Modal
        opened={deleteOpened}
        onClose={() => {
          setDeleteOpened(false);
          setSelectedResource(null);
        }}
        title="删除上传"
        centered
        radius="xl"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--color-ink-soft)]">
            确认删除
            <span className="font-semibold text-[var(--color-ink-strong)]">
              {selectedResource ? `《${selectedResource.original_filename}》` : "这份资料"}
            </span>
            吗？删除后将无法恢复，资料文件也会一并移除。
          </p>

          {deleteErrorMessage ? (
            <Alert
              icon={<AlertCircle size={16} />}
              color="red"
              radius="xl"
              title="删除失败"
            >
              {deleteErrorMessage}
            </Alert>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="admin-secondary-btn flex-1"
              onClick={() => setDeleteOpened(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              className="admin-primary-btn flex-1 justify-center"
              onClick={() => void deleteRequest.run()}
              disabled={deleteRequest.loading}
            >
              <Trash2 />
              {deleteRequest.loading ? "正在删除..." : "确认删除"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
