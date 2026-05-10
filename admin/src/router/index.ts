import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        public: true,
        title: '登录',
      },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: {
            title: '工作台',
          },
        },
        {
          path: 'resources',
          name: 'resources',
          component: () => import('@/views/resources/ResourceListView.vue'),
          meta: {
            title: '资料管理',
          },
        },
        {
          path: 'subjects',
          name: 'subjects',
          component: () => import('@/views/subjects/SubjectListView.vue'),
          meta: {
            title: '学科管理',
          },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UserCenterView.vue'),
          meta: {
            title: '用户画像',
          },
        },
        {
          path: 'operations',
          name: 'operations',
          component: () => import('@/views/system/OperationLogView.vue'),
          meta: {
            title: '运营日志',
          },
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/system/SystemSettingsView.vue'),
          meta: {
            title: '系统设置',
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  if (!authStore.bootstrapped) {
    await authStore.bootstrap()
  }

  if (!to.meta.public && !authStore.isLoggedIn) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.name === 'login' && authStore.isLoggedIn) {
    return { name: 'dashboard' }
  }

  document.title = `${String(to.meta.title || '后台管理')} - ExamStack`
  return true
})

export default router
