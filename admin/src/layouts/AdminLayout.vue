<script setup lang="ts">
import {
  Collection,
  DataBoard,
  Files,
  Fold,
  Histogram,
  Menu as MenuIcon,
  Operation,
  Setting,
  SwitchButton,
  User,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const collapsed = ref(false)
const mobileOpen = ref(false)
const appMode = import.meta.env.MODE

const menuItems = [
  { index: '/dashboard', title: '工作台', icon: DataBoard },
  { index: '/resources', title: '资料管理', icon: Files },
  { index: '/subjects', title: '学科管理', icon: Collection },
  { index: '/users', title: '用户画像', icon: User },
  { index: '/operations', title: '运营日志', icon: Operation },
  { index: '/settings', title: '系统设置', icon: Setting },
]

const activePath = computed(() => route.path)
const currentTitle = computed(() => String(route.meta.title || '后台管理'))

function handleSelect(index: string) {
  mobileOpen.value = false
  void router.push(index)
}

async function handleLogout() {
  await ElMessageBox.confirm('确认退出当前管理员会话？', '退出登录', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
  authStore.logout()
  await router.push('/login')
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed, 'sidebar--mobile-open': mobileOpen }">
      <div class="brand">
        <div class="brand-mark">
          <Histogram />
        </div>
        <div v-show="!collapsed" class="brand-copy">
          <strong>ExamStack</strong>
          <span>资料共享后台</span>
        </div>
      </div>

      <el-menu
        :default-active="activePath"
        :collapse="collapsed"
        class="sidebar-menu"
        router
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <div v-if="mobileOpen" class="sidebar-mask" @click="mobileOpen = false" />

    <section class="main-panel">
      <header class="topbar">
        <div class="topbar-left">
          <el-button class="desktop-toggle" :icon="Fold" circle @click="collapsed = !collapsed" />
          <el-button class="mobile-toggle" :icon="MenuIcon" circle @click="mobileOpen = true" />
          <div>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>后台</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
            <p>面向资源、学科和用户运营的管理控制台</p>
          </div>
        </div>

        <div class="topbar-actions">
          <el-tag effect="plain" round>API {{ appMode }}</el-tag>
          <el-dropdown trigger="click">
            <button class="user-chip" type="button">
              <el-avatar :size="32" :src="authStore.user?.avatar_url || ''">
                {{ authStore.displayName.slice(0, 1).toUpperCase() }}
              </el-avatar>
              <span>{{ authStore.displayName }}</span>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/users')">账户资料</el-dropdown-item>
                <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </section>
  </div>
</template>
