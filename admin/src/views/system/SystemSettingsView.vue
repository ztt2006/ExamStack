<script setup lang="ts">
import { Connection, Monitor, Refresh, Setting } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'

import { checkSystemHealth } from '@/api/system'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { SystemHealth } from '@/types'
import { formatDate, getApiBaseUrl } from '@/utils/format'

const loading = ref(false)
const health = ref<SystemHealth | null>(null)
const appMode = import.meta.env.MODE

async function handleCheck() {
  loading.value = true
  try {
    health.value = await checkSystemHealth()
  } finally {
    loading.value = false
  }
}

onMounted(handleCheck)
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="系统设置" description="查看当前管理端运行环境、接口地址和后端健康状态。">
      <template #actions>
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="handleCheck">
          检查服务
        </el-button>
      </template>
    </PageHeader>

    <section class="metric-grid metric-grid--three">
      <MetricCard label="运行环境" :value="appMode" hint="Vite mode" :icon="Monitor" tone="blue" />
      <MetricCard
        label="后端状态"
        :value="health?.online ? '在线' : '离线'"
        :hint="health?.message || '等待检查'"
        :icon="Connection"
        :tone="health?.online ? 'green' : 'rose'"
      />
      <MetricCard label="配置项" value="6" hint="当前管理端配置" :icon="Setting" tone="amber" />
    </section>

    <el-card class="admin-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>环境配置</span>
          <el-tag :type="health?.online ? 'success' : 'danger'" round>
            {{ health?.online ? 'connected' : 'disconnected' }}
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="API 地址">{{ getApiBaseUrl() }}</el-descriptions-item>
        <el-descriptions-item label="构建模式">{{ appMode }}</el-descriptions-item>
        <el-descriptions-item label="检查时间">{{ formatDate(health?.checkedAt) }}</el-descriptions-item>
        <el-descriptions-item label="服务消息">{{ health?.message || '-' }}</el-descriptions-item>
        <el-descriptions-item label="认证存储">localStorage: examstack-admin-session</el-descriptions-item>
        <el-descriptions-item label="说明">
          当前后端已提供登录、资源、学科和个人资料接口；全量用户管理、角色权限、全局删除等能力需要后端继续补充专用 admin API。
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="admin-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>后台能力清单</span>
          <el-tag round>已接入</el-tag>
        </div>
      </template>
      <div class="capability-grid">
        <div class="capability-item">
          <strong>认证会话</strong>
          <span>JWT 自动注入、401 过期跳转、会话持久化。</span>
        </div>
        <div class="capability-item">
          <strong>资源运营</strong>
          <span>搜索、分页、预览、下载、上传和本人资料维护。</span>
        </div>
        <div class="capability-item">
          <strong>学科维护</strong>
          <span>学科分类分组、新增学科、重复编码由后端校验。</span>
        </div>
        <div class="capability-item">
          <strong>账户中心</strong>
          <span>个人资料、头像上传、积分与上传贡献概览。</span>
        </div>
      </div>
    </el-card>
  </div>
</template>
