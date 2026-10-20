<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// 目前只有一个示例项目，先写死；以后接后端
const projects = [
  {
    id: 1,
    name: '零碳园区示范项目',
    region: '江苏沿海',
    planYear: 2026,
    wind: 50,
    pv: 80,
    storage: '20 MW / 80 MWh',
  },
]

function openProject(id: number) {
  router.push(`/projects/${id}/dashboard`)
}

async function doLogout() {
  await auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <strong>友好型源网荷储一体化规划配置仿真平台</strong>
        <span class="muted">项目管理</span>
      </div>
      <div class="user">
        <span class="muted">{{ auth.admin?.display_name ?? auth.admin?.username }}</span>
        <button @click="doLogout">退出登录</button>
      </div>
    </header>

    <main class="content">
      <h2>项目列表</h2>

      <div class="grid">
        <button v-for="p in projects" :key="p.id" class="card project" @click="openProject(p.id)">
          <div class="pname">{{ p.name }}</div>
          <div class="meta muted">{{ p.region }} · 规划年份 {{ p.planYear }}</div>
          <div class="meta">
            风电 {{ p.wind }} MW · 光伏 {{ p.pv }} MW · 储能 {{ p.storage }}
          </div>
          <div class="enter">进入项目 →</div>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.topbar {
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0e1729;
  border-bottom: 1px solid #1f2f47;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.brand .muted {
  font-size: 12px;
}

.user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.content {
  padding: 28px 24px;
  max-width: 1100px;
  margin: 0 auto;
}

h2 {
  font-size: 16px;
  margin: 0 0 18px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.project {
  text-align: left;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project:hover {
  border-color: #2aa387;
}

.pname {
  font-size: 16px;
  color: #eaf2ff;
}

.meta {
  font-size: 13px;
}

.enter {
  margin-top: 10px;
  color: #5ee0c0;
  font-size: 13px;
}
</style>
