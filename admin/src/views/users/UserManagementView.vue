<script setup lang="ts">
import { Edit, Key, Refresh, Search, UserFilled, Wallet } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import {
  getAdminUserDetail,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
  updateAdminUserPoints,
} from '@/api/users'
import MetricCard from '@/components/MetricCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useOperationStore } from '@/stores/operation'
import type { AdminUser } from '@/types'
import { formatDate, resolveBackendUrl } from '@/utils/format'

const authStore = useAuthStore()
const operationStore = useOperationStore()
const loading = ref(false)
const detailLoading = ref(false)
const saving = ref(false)
const pointsSaving = ref(false)
const passwordSaving = ref(false)
const detailVisible = ref(false)
const selectedUser = ref<AdminUser | null>(null)
const editFormRef = ref<FormInstance>()
const pointsFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const users = ref<AdminUser[]>([])

const filters = reactive({
  keyword: '',
  page: 1,
  page_size: 10,
})

const pagination = reactive({
  total: 0,
})

const editForm = reactive({
  username: '',
  email: '',
  school: '',
})

const pointsForm = reactive({
  points: 0,
  reason: 'admin_adjustment',
})

const passwordForm = reactive({
  password: '',
})

const editRules: FormRules<typeof editForm> = {
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

const pointsRules: FormRules<typeof pointsForm> = {
  points: [{ required: true, type: 'number', min: 0, message: '积分不能小于 0', trigger: 'blur' }],
  reason: [{ required: true, min: 2, message: '请输入调整原因', trigger: 'blur' }],
}

const passwordRules: FormRules<typeof passwordForm> = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

const totalPoints = computed(() => users.value.reduce((total, item) => total + item.points, 0))
const totalUploads = computed(() => users.value.reduce((total, item) => total + item.uploaded_count, 0))
const totalDownloads = computed(() => users.value.reduce((total, item) => total + item.download_count, 0))

async function loadUsers() {
  loading.value = true
  try {
    const payload = await getAdminUsers(filters)
    users.value = payload.items
    pagination.total = payload.pagination.total
  } finally {
    loading.value = false
  }
}

async function openDetail(user: AdminUser) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const detail = await getAdminUserDetail(user.id)
    selectedUser.value = detail
    syncForms(detail)
  } finally {
    detailLoading.value = false
  }
}

function syncForms(user: AdminUser) {
  editForm.username = user.username
  editForm.email = user.email
  editForm.school = user.school
  pointsForm.points = user.points
  pointsForm.reason = 'admin_adjustment'
  passwordForm.password = ''
}

function handleSearch() {
  filters.page = 1
  void loadUsers()
}

async function handleSaveProfile() {
  if (!selectedUser.value) {
    return
  }
  const valid = await editFormRef.value?.validate()
  if (!valid) {
    return
  }

  saving.value = true
  try {
    const updated = await updateAdminUser(selectedUser.value.id, editForm)
    selectedUser.value = updated
    syncForms(updated)
    operationStore.record({
      module: '用户管理',
      action: '修改用户资料',
      target: updated.username,
      operator: authStore.displayName,
      status: 'success',
    })
    ElMessage.success('用户资料已更新')
    await loadUsers()
  } finally {
    saving.value = false
  }
}

async function handleSavePoints() {
  if (!selectedUser.value) {
    return
  }
  const valid = await pointsFormRef.value?.validate()
  if (!valid) {
    return
  }

  pointsSaving.value = true
  try {
    const updated = await updateAdminUserPoints(selectedUser.value.id, {
      points: pointsForm.points,
      reason: pointsForm.reason,
    })
    selectedUser.value = updated
    syncForms(updated)
    operationStore.record({
      module: '用户管理',
      action: '调整积分',
      target: `${updated.username}: ${updated.points}`,
      operator: authStore.displayName,
      status: 'warning',
    })
    ElMessage.success('用户积分已更新')
    await loadUsers()
  } finally {
    pointsSaving.value = false
  }
}

async function handleResetPassword() {
  if (!selectedUser.value) {
    return
  }
  const valid = await passwordFormRef.value?.validate()
  if (!valid) {
    return
  }

  await ElMessageBox.confirm(`确认重置「${selectedUser.value.username}」的登录密码？`, '重置密码', {
    confirmButtonText: '确认重置',
    cancelButtonText: '取消',
    type: 'warning',
  })

  passwordSaving.value = true
  try {
    const updated = await resetAdminUserPassword(selectedUser.value.id, {
      password: passwordForm.password,
    })
    selectedUser.value = updated
    passwordForm.password = ''
    operationStore.record({
      module: '用户管理',
      action: '重置密码',
      target: updated.username,
      operator: authStore.displayName,
      status: 'warning',
    })
    ElMessage.success('用户密码已重置')
  } finally {
    passwordSaving.value = false
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="用户管理" description="查看全部用户信息，维护用户资料、积分，并可直接重置登录密码。">
      <template #actions>
        <el-button :icon="Refresh" @click="loadUsers">刷新</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid metric-grid--three">
      <MetricCard label="用户总数" :value="pagination.total" hint="全平台注册用户" :icon="UserFilled" tone="blue" />
      <MetricCard label="当前页积分" :value="totalPoints" hint="用于快速排查异常余额" :icon="Wallet" tone="amber" />
      <MetricCard label="资源贡献" :value="totalUploads" :hint="`${totalDownloads} 次下载记录`" :icon="Edit" tone="green" />
    </section>

    <el-card class="admin-card" shadow="never">
      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          :prefix-icon="Search"
          placeholder="搜索用户名、邮箱或学校"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table v-loading="loading" :data="users" class="mt-5" empty-text="暂无用户">
        <el-table-column label="用户" min-width="220">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="36" :src="resolveBackendUrl(row.avatar_url)">
                {{ row.username.slice(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="min-w-0">
                <div class="table-title">{{ row.username }}</div>
                <div class="table-subtitle">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="school" label="学校" min-width="180" />
        <el-table-column label="积分" width="110">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.points }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上传/下载" width="130">
          <template #default="{ row }">{{ row.uploaded_count }} / {{ row.download_count }}</template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button :icon="Edit" link type="primary" @click="openDetail(row)">管理</el-button>
            <el-button :icon="Key" link type="warning" @click="openDetail(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="filters.page"
          v-model:page-size="filters.page_size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @change="loadUsers"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="管理用户" width="760px">
      <div v-loading="detailLoading" class="user-management-dialog">
        <div v-if="selectedUser" class="managed-user-summary">
          <el-avatar :size="56" :src="resolveBackendUrl(selectedUser.avatar_url)">
            {{ selectedUser.username.slice(0, 1).toUpperCase() }}
          </el-avatar>
          <div>
            <strong>{{ selectedUser.username }}</strong>
            <span>{{ selectedUser.email }} / {{ selectedUser.school }}</span>
          </div>
          <el-tag type="warning" effect="plain">{{ selectedUser.points }} 积分</el-tag>
        </div>

        <el-tabs v-if="selectedUser">
          <el-tab-pane label="资料">
            <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-position="top">
              <div class="form-grid">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="editForm.username" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="editForm.email" />
                </el-form-item>
              </div>
              <el-form-item label="学校" prop="school">
                <el-input v-model="editForm.school" />
              </el-form-item>
              <el-button type="primary" :loading="saving" @click="handleSaveProfile">保存资料</el-button>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="积分">
            <el-form ref="pointsFormRef" :model="pointsForm" :rules="pointsRules" label-position="top">
              <div class="form-grid">
                <el-form-item label="积分余额" prop="points">
                  <el-input-number v-model="pointsForm.points" :min="0" :max="100000" class="w-full" />
                </el-form-item>
                <el-form-item label="调整原因" prop="reason">
                  <el-input v-model="pointsForm.reason" />
                </el-form-item>
              </div>
              <el-button type="warning" :loading="pointsSaving" @click="handleSavePoints">更新积分</el-button>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="密码">
            <el-alert
              class="mb-4"
              type="warning"
              show-icon
              :closable="false"
              title="重置后用户必须使用新密码登录，旧密码会立即失效。"
            />
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-position="top">
              <el-form-item label="新密码" prop="password">
                <el-input v-model="passwordForm.password" show-password placeholder="至少 6 位" />
              </el-form-item>
              <el-button type="danger" :icon="Key" :loading="passwordSaving" @click="handleResetPassword">
                重置密码
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
