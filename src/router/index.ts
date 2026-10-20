import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/projects' },

    // 登录页（不需要登录）
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },

    // 项目管理（管理员界面）
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
    },

    // 项目内的三个页面
    {
      path: '/projects/:id/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/projects/:id/imports',
      name: 'imports',
      component: () => import('@/views/ImportsView.vue'),
    },
    {
      path: '/projects/:id/reports',
      name: 'reports',
      component: () => import('@/views/ReportsView.vue'),
    },
  ],
})

// 路由守卫：非 public 页面先确认登录，未登录跳登录页
router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const auth = useAuthStore()
  await auth.load()

  if (!auth.admin) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
