<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const projectId = route.params.id
const types = [
  { code: 'source', name: '源荷气象数据', rows: 5832 },
  { code: 'typical_day', name: '典型日曲线', rows: 96 },
  { code: 'simulation', name: '运行仿真数据', rows: 5832 },
  { code: 'tariff', name: '分时电价', rows: 24 },
  { code: 'param', name: '参数配置', rows: 32 },
]
function back() {
  router.push(`/projects/${projectId}/dashboard`)
}
</script>
<template>
  <div class="page">
    <header class="topbar">
      <div class="left">
        <button @click="back">← 返回仪表盘</button>
        <strong>数据导入</strong>
      </div>
    </header>
    <main class="content">
      <div class="card upload">
        <div class="upload-icon">⬆</div>
        <p>拖拽文件到此处，或点击选择</p>
        <p class="muted small">支持 .csv / .xlsx，单次 ≤ 10 万行</p>
        <p class="muted small">（下一步接入后端 /api/imports）</p>
      </div>
      <h3>数据类型</h3>
      <div class="card list">
        <div v-for="t in types" :key="t.code" class="row">
          <span>{{ t.name }}</span>
          <span class="muted">{{ t.rows }} 行</span>
        </div>
      </div>
    </main>
  </div>
</template>
<style scoped>
.page {
  min-height: 100vh;
}

.topbar {
  gap: 12px;
}

.content {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.upload {
  padding: 48px 20px;
  text-align: center;
  border-style: dashed;
}

.upload-icon {
  font-size: 28px;
  color: #2aa387;
}

.small {
  font-size: 12px;
}

h3 {
  font-size: 14px;
  margin: 22px 0 10px;
}

.list {
  padding: 6px 16px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #1a2940;
}

.row:last-child {
  border-bottom: none;
}
</style>