<script setup lang="ts">
import { Avatar, Edit, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { getMyProfile, getMyResources, updateMyProfile, uploadMyAvatar } from '@/api/users'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useOperationStore } from '@/stores/operation'
import type { ProfileSummary, Resource } from '@/types'
import { formatDate, formatFileSize, resolveBackendUrl } from '@/utils/format'

const authStore = useAuthStore()
const operationStore = useOperationStore()
const loading = ref(false)
const saving = ref(false)
const avatarUploading = ref(false)
const formRef = ref<FormInstance>()
const profile = ref<ProfileSummary | null>(null)
const myResources = ref<Resource[]>([])

const form = reactive({
  username: '',
  email: '',
  school: '',
})

const rules: FormRules<typeof form> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少 3 位', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  school: [
    { required: true, message: '请输入学校', trigger: 'blur' },
    { min: 2, message: '学校名称至少 2 位', trigger: 'blur' },
  ],
}

const avatarUrl = computed(() => resolveBackendUrl(authStore.user?.avatar_url || profile.value?.avatar_url))

async function loadUserCenter() {
  loading.value = true
  try {
    const [profilePayload, resourcesPayload] = await Promise.all([
      getMyProfile(),
      getMyResources({ page: 1, page_size: 6 }),
    ])
    profile.value = profilePayload
    myResources.value = resourcesPayload.items
    form.username = profilePayload.username
    form.email = profilePayload.email
    form.school = profilePayload.school
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  saving.value = true
  try {
    const user = await updateMyProfile(form)
    authStore.setUser(user)
    operationStore.record({
      module: '用户',
      action: '更新资料',
      target: user.username,
      operator: authStore.displayName,
      status: 'success',
    })
    ElMessage.success('账户资料已更新')
    await loadUserCenter()
  } finally {
    saving.value = false
  }
}

async function handleAvatarChange(uploadFile: UploadFile) {
  if (!uploadFile.raw) {
    return false
  }
  avatarUploading.value = true
  try {
    const user = await uploadMyAvatar(uploadFile.raw)
    authStore.setUser(user)
    operationStore.record({
      module: '用户',
      action: '更新头像',
      target: user.username,
      operator: authStore.displayName,
      status: 'success',
    })
    ElMessage.success('头像已更新')
    await loadUserCenter()
  } finally {
    avatarUploading.value = false
  }
  return false
}

onMounted(loadUserCenter)
</script>

<template>
  <div class="space-y-6" v-loading="loading">
    <PageHeader title="用户画像" description="管理当前管理员账户资料，并查看个人资源贡献情况。">
      <template #actions>
        <el-button :icon="Refresh" @click="loadUserCenter">刷新</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid metric-grid--three">
      <MetricCard label="积分余额" :value="profile?.points ?? '-'" hint="用于下载资料" :icon="Avatar" tone="blue" />
      <MetricCard label="上传数量" :value="profile?.uploaded_count ?? 0" hint="个人贡献" :icon="UploadFilled" tone="green" />
      <MetricCard label="账户编号" :value="profile?.id ?? '-'" hint="用户主键" :icon="Edit" tone="amber" />
    </section>

    <section class="profile-grid">
      <el-card class="admin-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>账户资料</span>
            <el-tag type="success" round>已登录</el-tag>
          </div>
        </template>

        <div class="profile-head">
          <el-avatar :size="72" :src="avatarUrl">{{ form.username.slice(0, 1).toUpperCase() }}</el-avatar>
          <el-upload :show-file-list="false" :auto-upload="false" :on-change="handleAvatarChange">
            <el-button :loading="avatarUploading" :icon="UploadFilled">更换头像</el-button>
          </el-upload>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="mt-6">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="学校" prop="school">
            <el-input v-model="form.school" />
          </el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存资料</el-button>
        </el-form>
      </el-card>

      <el-card class="admin-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>我的上传</span>
            <el-tag round>{{ myResources.length }} 条</el-tag>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="resource in myResources"
            :key="resource.id"
            :timestamp="formatDate(resource.created_at)"
            placement="top"
          >
            <div class="timeline-card">
              <strong>{{ resource.original_filename }}</strong>
              <p>{{ resource.description }}</p>
              <span>{{ formatFileSize(resource.file_size) }} / {{ resource.download_count }} 次下载</span>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-if="!myResources.length" description="你还没有上传资料" />
      </el-card>
    </section>
  </div>
</template>
