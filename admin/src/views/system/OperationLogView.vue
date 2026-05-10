<script setup lang="ts">
import { Delete, Download, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

import PageHeader from '@/components/PageHeader.vue'
import { useOperationStore } from '@/stores/operation'
import type { OperationLog } from '@/types'
import { formatDate } from '@/utils/format'

const operationStore = useOperationStore()
const statusFilter = ref('')

const filteredLogs = computed(() => {
  if (!statusFilter.value) {
    return operationStore.logs
  }
  return operationStore.logs.filter((log) => log.status === statusFilter.value)
})

function statusType(status: OperationLog['status']) {
  return {
    success: 'success',
    warning: 'warning',
    error: 'danger',
  }[status]
}

function exportLogs() {
  const content = JSON.stringify(filteredLogs.value, null, 2)
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `examstack-admin-logs-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success('操作日志已导出')
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="运营日志" description="记录本管理端会话内的重要操作，便于快速回溯。">
      <template #actions>
        <el-button :icon="Download" @click="exportLogs">导出</el-button>
        <el-button type="danger" plain :icon="Delete" @click="operationStore.clear()">清空</el-button>
      </template>
    </PageHeader>

    <el-card class="admin-card" shadow="never">
      <div class="toolbar">
        <el-segmented
          v-model="statusFilter"
          :options="[
            { label: '全部', value: '' },
            { label: '成功', value: 'success' },
            { label: '提醒', value: 'warning' },
            { label: '失败', value: 'error' },
          ]"
        />
        <el-button :icon="Refresh" @click="statusFilter = ''">重置筛选</el-button>
      </div>

      <el-table :data="filteredLogs" class="mt-5" empty-text="暂无操作日志">
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column prop="action" label="操作" width="140" />
        <el-table-column prop="target" label="对象" min-width="180" />
        <el-table-column prop="operator" label="操作人" width="130" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="plain">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
