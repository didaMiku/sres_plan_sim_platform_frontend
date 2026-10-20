import { ref } from 'vue'
import { defineStore } from 'pinia'

import { login as apiLogin, logout as apiLogout, me as apiMe } from '@/api/auth'
import type { AdminInfo } from '@/api/http'

export const useAuthStore = defineStore('auth', () => {
  const admin = ref<AdminInfo | null>(null)
  const ready = ref(false) // 是否已经向后端确认过登录状态

  // 页面刷新后：问一次后端"我是谁"，失败就当未登录
  async function load() {
    if (ready.value) return
    try {
      admin.value = await apiMe()
    } catch {
      admin.value = null
    } finally {
      ready.value = true
    }
  }

  async function login(username: string, password: string) {
    const result = await apiLogin(username, password)
    admin.value = result.admin
    ready.value = true
    return result
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      admin.value = null
      ready.value = false
    }
  }

  return { admin, ready, load, login, logout }
})
