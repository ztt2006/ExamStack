<script setup lang="ts">
import { Delete, Download, EditPen, Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { deleteMyResource, getResources, updateMyResource, uploadResource } from '@/api/resources'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useOperationStore } from '@/stores/operation'
import type { Resource } from '@/types'
import { formatDate, formatFileSize, resolveBackendUrl } from '@/utils/format'

const authStore = useAuthStore()
const operationStore = useOperationStore()
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const editingResource = ref<Resource | null>(null)
const selectedFile = ref<File | null>(null)
const formRef = ref<FormInstance>()

const filters = reactive({
  keyword: '',
  page: 1,
  page_size: 10,
})

const pagination = reactive({
  total: 0,
})

const resources = ref<Resource[]>([])

const form = reactive({
  description: '',
})

const rules: FormRules<typeof form> = {
  description: [
    { required: true, message: '请输入资料描述', trigger: 'blur' },
    { min: 4, message: '描述至少 4 个字符', trigger: 'blur' },
  ],
}

const dialogTitle = computed(() => (editingResource.value ? '编辑我的资料' : '上传资料'))

async function loadResources() {
  loading.value = true
  try {
    const payload = await getResources(filters)
    resources.value = payload.items
    pagination.total = payload.pagination.total
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingResource.value = null
  form.description = ''
  selectedFile.value = null
  dialogVisible.value = true
}

function openEditDialog(resource: Resource) {
  editingResource.value = resource
  form.description = resource.description
  selectedFile.value = null
  dialogVisible.value = true
}

function beforeUpload(uploadFile: UploadFile) {
  selectedFile.value = uploadFile.raw ?? null
  return false
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  if (!editingResource.value && !selectedFile.value) {
    ElMessage.warning('请选择要上传的资料文件')
    return
  }

  saving.value = true
  try {
    if (editingResource.value) {
      await updateMyResource(editingResource.value.id, {
        description: form.description,
        file: selectedFile.value,
      })
      operationStore.record({
        module: '资料',
        action: '编辑资料',
        target: editingResource.value.original_filename,
        operator: authStore.displayName,
        status: 'success',
      })
      ElMessage.success('资料已更新')
    } else if (selectedFile.value) {
      const created = await uploadResource({
        description: form.description,
        file: selectedFile.value,
      })
      operationStore.record({
        module: '资料',
        action: '上传资料',
        target: created.original_filename,
        operator: authStore.displayName,
        status: 'success',
      })
      ElMessage.success('资料上传成功')
    }
    dialogVisible.value = false
    await loadResources()
  } finally {
    saving.value = false
  }
}

async function handleDelete(resource: Resource) {
  if (resource.uploader_id !== authStore.user?.id) {
    ElMessage.warning('后端当前只允许删除本人上传的资料')
    return
  }
  await ElMessageBox.confirm(`确认删除「${resource.original_filename}」？`, '删除资料', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await deleteMyResource(resource.id)
  operationStore.record({
    module: '资料',
    action: '删除资料',
    target: resource.original_filename,
    operator: authStore.displayName,
    status: 'warning',
  })
  ElMessage.success('资料已删除')
  await loadResources()
}

function handleSearch() {
  filters.page = 1
  void loadResources()
}

onMounted(loadResources)
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="资料管理" description="检索平台资源、预览资料内容、维护本人上传的资料。">
      <template #actions>
        <el-button :icon="Refresh" @click="loadResources">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">上传资料</el-button>
      </template>
    </PageHeader>

    <el-card class="admin-card" shadow="never">
      <div class="toolbar">
        <el-input
          v-model="filters.keyword"
          :prefix-icon="Search"
          placeholder="搜索文件名或描述"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </div>

      <el-table v-loading="loading" :data="resources" class="mt-5" empty-text="暂无资料">
        <el-table-column label="资料" min-width="260">
          <template #default="{ row }">
            <div class="table-title">{{ row.original_filename }}</div>
            <div class="table-subtitle">{{ row.description }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="uploader_name" label="上传者" width="120" />
        <el-table-column label="大小" width="110">
          <template #default="{ row }">{{ formatFileSize(row.file_size) }}</template>
        </el-table-column>
        <el-table-column label="下载" width="90">
          <template #default="{ row }">
            <el-tag type="info" effect="plain">{{ row.download_count }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button :icon="View" link type="primary" :href="resolveBackendUrl(row.preview_url)" tag="a" target="_blank">
              预览
            </el-button>
            <el-button :icon="Download" link :href="resolveBackendUrl(row.download_url)" tag="a" target="_blank">
              下载
            </el-button>
            <el-button :icon="EditPen" link type="warning" @click="openEditDialog(row)">编辑</el-button>
            <el-button :icon="Delete" link type="danger" @click="handleDelete(row)">删除</el-button>
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
          @change="loadResources"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="资料描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="说明资料适用课程、年份和内容亮点" />
        </el-form-item>
        <el-form-item :label="editingResource ? '替换文件（可选）' : '资料文件'">
          <el-upload drag :auto-upload="false" :limit="1" :on-change="beforeUpload" :on-remove="() => (selectedFile = null)">
            <el-icon class="el-icon--upload"><Plus /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或点击选择</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
