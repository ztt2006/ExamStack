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
    <section className="panel-card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[var(--color-sky-strong)]">
          <SlidersHorizontal size={16} />
          <span className="text-sm font-medium">筛选条件</span>
        </div>
        <span className="sky-chip">按课程、类型、关键词快速收束结果</span>
      </div>
      <div className="cloud-divider mb-5" />
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
              background: "oklch(0.995 0.012 230 / 0.92)",
              borderColor: "oklch(0.9 0.03 230)",
              minHeight: 48,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
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
              background: "oklch(0.995 0.012 230 / 0.92)",
              borderColor: "oklch(0.9 0.03 230)",
              minHeight: 48,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
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
              background: "oklch(0.995 0.012 230 / 0.92)",
              borderColor: "oklch(0.9 0.03 230)",
              minHeight: 48,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
            },
          }}
        />
      </div>
    </section>
  );
}
