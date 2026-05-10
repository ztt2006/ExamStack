<script setup lang="ts">
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

import { createSubject, getSubjects } from '@/api/subjects'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { useOperationStore } from '@/stores/operation'
import type { Subject } from '@/types'

const authStore = useAuthStore()
const operationStore = useOperationStore()
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const keyword = ref('')
const subjects = ref<Subject[]>([])
const formRef = ref<FormInstance>()

const form = reactive({
  name: '',
  code: '',
  category: '',
  description: '',
})

const rules: FormRules<typeof form> = {
  name: [{ required: true, message: '请输入学科名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入学科编码', trigger: 'blur' }],
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
}

const filteredSubjects = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) {
    return subjects.value
  }
  return subjects.value.filter((subject) =>
    [subject.name, subject.code, subject.category, subject.description || '']
      .join(' ')
      .toLowerCase()
      .includes(value),
  )
})

const groupedSubjects = computed(() => {
  return filteredSubjects.value.reduce<Record<string, Subject[]>>((groups, subject) => {
    const category = subject.category || '未分类'
    const group = groups[category] ?? []
    if (!groups[category]) {
      groups[category] = group
    }
    group.push(subject)
    return groups
  }, {})
})

async function loadSubjects() {
  loading.value = true
  try {
    subjects.value = await getSubjects()
  } finally {
    loading.value = false
  }
}

function openDialog() {
  form.name = ''
  form.code = ''
  form.category = ''
  form.description = ''
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }
  saving.value = true
  try {
    const created = await createSubject({
      name: form.name,
      code: form.code,
      category: form.category,
      description: form.description || undefined,
    })
    operationStore.record({
      module: '学科',
      action: '新增学科',
      target: created.name,
      operator: authStore.displayName,
      status: 'success',
    })
    ElMessage.success('学科已创建')
    dialogVisible.value = false
    await loadSubjects()
  } finally {
    saving.value = false
  }
}

onMounted(loadSubjects)
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="学科管理" description="维护资料平台的学科编码、分类和运营说明。">
      <template #actions>
        <el-button :icon="Refresh" @click="loadSubjects">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openDialog">新增学科</el-button>
      </template>
    </PageHeader>

    <el-card class="admin-card" shadow="never">
      <div class="toolbar">
        <el-input v-model="keyword" :prefix-icon="Search" placeholder="搜索学科、编码或分类" clearable />
        <el-tag round>{{ filteredSubjects.length }} / {{ subjects.length }}</el-tag>
      </div>

      <div v-loading="loading" class="subject-board">
        <section v-for="(items, category) in groupedSubjects" :key="category" class="subject-section">
          <div class="subject-section-title">
            <strong>{{ category }}</strong>
            <span>{{ items.length }} 个学科</span>
          </div>
          <div class="subject-list">
            <article v-for="subject in items" :key="subject.id" class="subject-card">
              <div>
                <strong>{{ subject.name }}</strong>
                <el-tag size="small" effect="plain">{{ subject.code }}</el-tag>
              </div>
              <p>{{ subject.description || '暂未填写学科说明。' }}</p>
            </article>
          </div>
        </section>
        <el-empty v-if="!filteredSubjects.length" description="暂无匹配学科" />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增学科" width="540px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="学科名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：高等数学" />
        </el-form-item>
        <el-form-item label="学科编码" prop="code">
          <el-input v-model="form.code" placeholder="例如：MATH-101" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-input v-model="form.category" placeholder="例如：公共基础课" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="选填：适用专业、资料类型等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>
