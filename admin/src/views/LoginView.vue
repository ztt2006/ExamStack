<script setup lang="ts">
import { Lock, User, View } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCurrentUser, login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import type { LoginPayload } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const passwordVisible = ref(false)

const form = reactive<LoginPayload>({
  account: '',
  password: '',
})

const rules: FormRules<LoginPayload> = {
  account: [{ required: true, message: '请输入用户名或邮箱', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    return
  }

  loading.value = true
  try {
    const token = await login(form)
    authStore.token = token.access_token
    const user = await getCurrentUser()
    authStore.setSession(token.access_token, user)
    ElMessage.success('欢迎回来，管理会话已建立')
    await router.push(String(route.query.redirect || '/dashboard'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-visual">
      <div class="login-orbit">
        <span />
        <span />
        <span />
      </div>
      <div class="login-copy">
        <p>ExamStack Admin</p>
        <h1>期末资料共享平台运营后台</h1>
        <span>统一管理资源流转、学科分类、用户资产与系统状态。</span>
      </div>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <div class="login-title">
          <strong>管理员登录</strong>
          <span>使用平台账号进入后台管理</span>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
          <el-form-item label="账号" prop="account">
            <el-input v-model="form.account" :prefix-icon="User" size="large" placeholder="用户名或邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              :prefix-icon="Lock"
              :suffix-icon="View"
              :type="passwordVisible ? 'text' : 'password'"
              size="large"
              placeholder="请输入登录密码"
              show-password
              @keyup.enter="handleSubmit"
            />
          </el-form-item>
          <el-button class="w-full" type="primary" size="large" :loading="loading" @click="handleSubmit">
            登录后台
          </el-button>
        </el-form>

        <el-alert
          class="mt-5"
          type="info"
          show-icon
          :closable="false"
          title="当前后端尚未区分管理员角色，后台会复用已登录用户权限。"
        />
      </div>
    </section>
  </main>
</template>
