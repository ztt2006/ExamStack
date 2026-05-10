<script setup lang="ts">
import { Collection, Files, TrendCharts, User } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'

import { getResources } from '@/api/resources'
import { getSubjects } from '@/api/subjects'
import { getMyProfile } from '@/api/users'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { ProfileSummary, Resource, Subject } from '@/types'
import { formatFileSize, formatShortDate, percent } from '@/utils/format'

const loading = ref(false)
const resources = ref<Resource[]>([])
const totalResources = ref(0)
const subjects = ref<Subject[]>([])
const profile = ref<ProfileSummary | null>(null)

const totalDownloads = computed(() =>
  resources.value.reduce((total, resource) => total + resource.download_count, 0),
)
const totalFileSize = computed(() =>
  resources.value.reduce((total, resource) => total + resource.file_size, 0),
)
const activeResource = computed(() => resources.value[0])

async function loadDashboard() {
  loading.value = true
  try {
    const [resourcePayload, subjectPayload, profilePayload] = await Promise.all([
      getResources({ page: 1, page_size: 8 }),
      getSubjects(),
      getMyProfile(),
    ])
    resources.value = resourcePayload.items
    totalResources.value = resourcePayload.pagination.total
    subjects.value = subjectPayload
    profile.value = profilePayload
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="space-y-6" v-loading="loading">
    <PageHeader title="工作台" description="查看平台资源增长、下载热度和当前管理员账户状态。">
      <template #actions>
        <el-button type="primary" @click="loadDashboard">刷新数据</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard label="资源总量" :value="totalResources" hint="平台资料库" :icon="Files" tone="blue" />
      <MetricCard label="学科分类" :value="subjects.length" hint="可用于资源归类" :icon="Collection" tone="green" />
      <MetricCard label="下载次数" :value="totalDownloads" hint="当前页资源累计" :icon="TrendCharts" tone="amber" />
      <MetricCard
        label="我的积分"
        :value="profile?.points ?? '-'"
        :hint="`${profile?.uploaded_count ?? 0} 份个人上传`"
        :icon="User"
        tone="rose"
      />
    </section>

    <section class="dashboard-grid">
      <el-card class="admin-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>近期资源</span>
            <el-tag round>{{ formatFileSize(totalFileSize) }}</el-tag>
          </div>
        </template>
        <el-table :data="resources" empty-text="暂无资源数据">
          <el-table-column prop="original_filename" label="文件" min-width="190">
            <template #default="{ row }">
              <div class="table-title">{{ row.original_filename }}</div>
              <div class="table-subtitle">{{ row.description }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="uploader_name" label="上传者" width="110" />
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatFileSize(row.file_size) }}</template>
          </el-table-column>
          <el-table-column label="热度" width="150">
            <template #default="{ row }">
              <el-progress
                :percentage="percent(row.download_count, Math.max(totalDownloads, 1))"
                :stroke-width="8"
                :show-text="false"
              />
              <span class="table-subtitle">{{ row.download_count }} 次下载</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="space-y-6">
        <el-card class="admin-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>当前重点</span>
              <el-tag type="success" round>运营</el-tag>
            </div>
          </template>
          <div v-if="activeResource" class="focus-resource">
            <strong>{{ activeResource.original_filename }}</strong>
            <p>{{ activeResource.description }}</p>
            <div>
              <el-statistic title="文件体积" :value="activeResource.file_size">
                <template #suffix>B</template>
              </el-statistic>
              <el-statistic title="下载" :value="activeResource.download_count" />
            </div>
          </div>
          <el-empty v-else description="暂无可分析资源" />
        </el-card>

        <el-card class="admin-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>学科覆盖</span>
              <el-tag round>{{ subjects.length }} 项</el-tag>
            </div>
          </template>
          <div class="subject-cloud">
            <el-tag v-for="subject in subjects.slice(0, 12)" :key="subject.id" effect="plain">
              {{ subject.name }}
            </el-tag>
          </div>
          <p class="mt-4 text-sm text-slate-500">
            最近更新：{{ formatShortDate(activeResource?.created_at) }}
          </p>
        </el-card>
      </div>
    </section>
  </div>
</template>
