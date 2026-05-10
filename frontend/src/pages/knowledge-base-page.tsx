import { BookOpenText, LibraryBig, Sparkles } from "lucide-react";

export function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-card hero-panel p-6 sm:p-8">
          <div className="section-badge">Knowledge Base</div>
          <h1 className="section-title mt-3 text-[2.35rem]">知识库</h1>
          <p className="page-copy mt-4 max-w-[56ch]">
            这里会逐步沉淀结构化知识、整理资料、学习主题和可复用内容。当前先把页面入口搭好，后续我们可以继续完善内容组织、检索和管理能力。
          </p>
        </div>

        <div className="panel-card p-6">
          <div className="flex items-center gap-3">
            <div className="metric-icon h-11 w-11">
              <LibraryBig size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-sky-strong)]">
                Coming Next
              </p>
              <h2 className="font-heading text-2xl font-semibold text-[var(--color-ink-strong)]">
                后续可继续扩展
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="metric-card">
              <div className="flex items-center gap-3">
                <div className="metric-icon">
                  <BookOpenText size={18} />
                </div>
                <div>
                  <p className="metric-label">内容沉淀</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">分类整理知识条目、文档和主题内容</p>
                </div>
              </div>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-3">
                <div className="metric-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="metric-label">能力预留</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]">后面可以继续加搜索、标签、分组和权限能力</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
