import { Select, TextInput } from "@mantine/core";
import { Search, SlidersHorizontal } from "lucide-react";

import type { Subject } from "@/types";

interface ResourceFiltersProps {
  keyword: string;
  subjectId: string;
  resourceType: string;
  subjects: Subject[];
  onKeywordChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onResourceTypeChange: (value: string) => void;
}

export function ResourceFilters({
  keyword,
  subjectId,
  resourceType,
  subjects,
  onKeywordChange,
  onSubjectChange,
  onResourceTypeChange,
}: ResourceFiltersProps) {
  return (
    <section className="panel-card p-5">
      <div className="mb-4 flex items-center gap-2 text-[oklch(0.42_0.01_255)]">
        <SlidersHorizontal size={16} />
        <span className="text-sm font-medium">筛选条件</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr_1fr]">
        <TextInput
          value={keyword}
          onChange={(event) => onKeywordChange(event.currentTarget.value)}
          size="md"
          radius="xl"
          placeholder="搜课程名、关键词、笔记内容"
          leftSection={<Search size={16} />}
          styles={{
            input: {
              background: "white",
              borderColor: "oklch(0.9 0.01 255)",
              minHeight: 44,
            },
          }}
        />
        <Select
          value={subjectId}
          onChange={(value) => onSubjectChange(value ?? "")}
          size="md"
          radius="xl"
          placeholder="全部科目"
          data={[
            { value: "", label: "全部科目" },
            ...subjects.map((subject) => ({
              value: String(subject.id),
              label: `${subject.name} · ${subject.code}`,
            })),
          ]}
          styles={{
            input: {
              background: "white",
              borderColor: "oklch(0.9 0.01 255)",
              minHeight: 44,
            },
          }}
        />
        <Select
          value={resourceType}
          onChange={(value) => onResourceTypeChange(value ?? "")}
          size="md"
          radius="xl"
          placeholder="资料类型"
          data={[
            { value: "", label: "全部类型" },
            { value: "document", label: "整理文档" },
            { value: "pdf", label: "试题 PDF" },
            { value: "image", label: "图片资料" },
          ]}
          styles={{
            input: {
              background: "white",
              borderColor: "oklch(0.9 0.01 255)",
              minHeight: 44,
            },
          }}
        />
      </div>
    </section>
  );
}
