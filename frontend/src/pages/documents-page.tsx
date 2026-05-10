import { Alert, TextInput } from "@mantine/core";
import { useDebounce, useRequest } from "ahooks";
import { AlertCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { getResources } from "@/api/resources";
import { ResourceTable } from "@/components/resource/resource-table";

export function DocumentsPage() {
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
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

  return (
    <div className="space-y-6">
      <section className="panel-card p-6">
        <h2 className="section-title text-[2rem]">资料</h2>
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
    </div>
  );
}
