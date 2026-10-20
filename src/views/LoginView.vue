<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('admin')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    // 从哪来跳回哪去，没有就进项目列表
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/projects'
    await router.replace(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="wrap">
    <form class="card box" @submit.prevent="submit">
      <h1>友好型源网荷储一体化<br />规划配置仿真平台</h1>
      <p class="muted sub">管理员登录</p>

      <label>用户名</label>
      <input v-model="username" autocomplete="username" />

      <label>密码</label>
      <input v-model="password" type="password" autocomplete="current-password" />

      <p v-if="error" class="err">{{ error }}</p>

      <button class="primary submit" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <p class="muted tip">默认账号：admin / 1234</p>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 0%, #14243d 0%, #0b1220 60%);
}

.box {
  width: 380px;
  padding: 32px 30px;
}

h1 {
  font-size: 18px;
  line-height: 1.5;
  margin: 0 0 6px;
  color: #eaf2ff;
}

.sub {
  margin: 0 0 22px;
}

label {
  display: block;
  margin: 14px 0 6px;
  color: #9fb0c9;
  font-size: 13px;
}

.submit {
  width: 100%;
  margin-top: 22px;
  padding: 10px;
}

.err {
  color: #ff7a7a;
  margin: 12px 0 0;
  font-size: 13px;
}

.tip {
  text-align: center;
  margin: 16px 0 0;
  font-size: 12px;
}
</style>
