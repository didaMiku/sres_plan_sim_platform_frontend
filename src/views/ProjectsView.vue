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
        <b>LIBRA STELLA</b>
        <span>源网荷储一体化规划配置仿真平台</span>
      </div>
      <div class="user">
        <span class="micro">{{ auth.admin?.display_name ?? auth.admin?.username }}</span>
        <button @click="doLogout">退出登录</button>
      </div>
    </header>

    <main class="content">
      <section class="hero">
        <h1 class="display">Projects</h1>
        <div class="meta">
          <span class="micro">PROJECT—01 / 零碳园区</span>
          <span class="micro">2026 · 江苏沿海</span>
        </div>
      </section>

      <nav class="list">
        <button v-for="(p, i) in projects" :key="p.id" class="row" @click="openProject(p.id)">
          <span class="no">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="tt">
            <b>{{ p.name }}</b>
            <i>ZERO-CARBON PARK</i>
          </span>
          <span class="cn">
            {{ p.region }} · 规划年份 {{ p.planYear }} · 风电 {{ p.wind }} MW · 光伏 {{ p.pv }} MW · 储能
            {{ p.storage }}
          </span>
          <span class="go">→</span>
        </button>
      </nav>
    </main>

    <footer class="foot">
      <span class="micro">ALL SYSTEMS NOMINAL</span>
      <span class="micro">№ APL—026</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 clamp(18px, 3.4vw, 58px);
}

.micro {
  font-family: var(--f-tech);
  font-size: 9.5px;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: var(--ink-4);
}

.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--rule);
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.brand b {
  font-family: var(--f-display);
  font-size: 13px;
  letter-spacing: 0.3em;
}

.brand span {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ink-4);
}

.user {
  display: flex;
  align-items: center;
  gap: 14px;
}

.content {
  flex: 1;
  padding: clamp(30px, 5vw, 64px) 0;
}

.hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 30px;
  padding-bottom: clamp(26px, 4vw, 52px);
}

.display {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 800;
  font-size: clamp(56px, 9vw, 150px);
  line-height: 0.78;
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.meta {
  text-align: right;
  display: grid;
  gap: 6px;
  line-height: 1.6;
}

.list {
  border-top: 1px solid var(--rule);
}

.row {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 60px 180px 1fr 44px;
  align-items: center;
  gap: clamp(12px, 2.4vw, 40px);
  padding: clamp(16px, 2.3vw, 28px) 0;
  border-bottom: 1px solid var(--rule);
  border-left: none;
  border-right: none;
  border-top: none;
  background: transparent;
  text-align: left;
  color: inherit;
  transition: background 0.3s, padding 0.3s;
}

.row:hover {
  background: var(--ink);
  color: var(--paper);
  padding-left: 14px;
  padding-right: 14px;
}

.row:hover .no {
  color: var(--amber);
}

.row:hover .tt i,
.row:hover .cn {
  color: var(--paper-lo);
}

.row:hover .go {
  background: var(--amber);
  color: var(--ink);
}

.no {
  font-family: var(--f-display);
  font-weight: 700;
  font-size: 20px;
  color: var(--ink-4);
}

.tt b {
  display: block;
  font-family: var(--f-zh);
  font-size: 17px;
  letter-spacing: 0.06em;
}

.tt i {
  display: block;
  margin-top: 4px;
  font-style: normal;
  font-family: var(--f-tech);
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--ink-4);
}

.cn {
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ink-3);
  line-height: 1.7;
}

.go {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-family: var(--f-tech);
  font-size: 13px;
}

.foot {
  display: flex;
  justify-content: space-between;
  padding: 22px 0 26px;
  border-top: 1px solid var(--rule);
}

@media (max-width: 860px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta {
    text-align: left;
  }

  .row {
    grid-template-columns: 40px 1fr 38px;
  }

  .cn {
    display: none;
  }
}
</style>
