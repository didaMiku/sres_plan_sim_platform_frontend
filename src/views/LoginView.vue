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
    <section class="poster">
      <div class="brandline">
        <span class="micro">SOURCE · GRID · LOAD · STORAGE</span>
        <span class="micro">№ 2026—04</span>
      </div>
      <h1 class="display">Aphelion</h1>
      <p class="cn">友好型源网荷储一体化规划配置仿真平台</p>
      <div class="trio"><i></i><i></i><i></i></div>
    </section>

    <form class="box" @submit.prevent="submit">
      <p class="micro">ADMIN ACCESS</p>
      <h2>管理员登录</h2>

      <label>用户名</label>
      <input v-model="username" autocomplete="username" />

      <label>密码</label>
      <input v-model="password" type="password" autocomplete="current-password" />

      <p v-if="error" class="err">{{ error }}</p>

      <button class="primary submit" type="submit" :disabled="loading">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <p class="micro tip">DEFAULT — ADMIN / 1234</p>
    </form>
  </div>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
}

.poster {
  padding: clamp(36px, 5vw, 72px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-right: 1px solid var(--rule);
  background: var(--paper);
}

.brandline {
  display: flex;
  justify-content: space-between;
  color: var(--ink-4);
  margin-bottom: auto;
}

.micro {
  font-family: var(--f-tech);
  font-size: 9.5px;
  letter-spacing: 0.19em;
  text-transform: uppercase;
}

.display {
  margin: 0 0 18px;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: clamp(64px, 10.5vw, 168px);
  line-height: 0.8;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.cn {
  margin: 0 0 26px;
  font-family: var(--f-zh);
  font-size: clamp(12px, 1vw, 14px);
  letter-spacing: 0.26em;
  color: var(--ink-3);
}

.trio {
  display: flex;
  height: 10px;
}

.trio i {
  flex: 1;
}

.trio i:nth-child(1) {
  background: var(--red);
  flex: 1.06;
}

.trio i:nth-child(2) {
  background: var(--amber);
  flex: 1.24;
}

.trio i:nth-child(3) {
  background: var(--teal);
}

.box {
  padding: clamp(36px, 6vw, 76px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--paper);
}

.box > .micro {
  color: var(--ink-4);
  margin: 0 0 8px;
}

h2 {
  margin: 0 0 26px;
  font-family: var(--f-zh);
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

label {
  display: block;
  margin: 14px 0 6px;
  font-family: var(--f-tech);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-4);
}

input {
  border: none;
  border-bottom: 1px solid var(--ink);
  background: transparent;
  padding: 8px 0;
}

input:focus {
  box-shadow: none;
  border-bottom-color: var(--amber);
}

.submit {
  width: 100%;
  margin-top: 26px;
  padding: 11px;
}

.err {
  color: var(--red);
  font-size: 12px;
  margin: 12px 0 0;
}

.tip {
  text-align: center;
  margin: 18px 0 0;
  color: var(--ink-4);
}

@media (max-width: 860px) {
  .wrap {
    grid-template-columns: 1fr;
  }

  .poster {
    border-right: none;
    border-bottom: 1px solid var(--rule);
  }

  .display {
    font-size: clamp(56px, 16vw, 110px);
  }
}
</style>
