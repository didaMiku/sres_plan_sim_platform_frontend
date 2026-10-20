<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const projectId = computed(() => route.params.id)

// 暂时写死的示例数据，后续从后端 /api/dashboard/* 取
const kpis = [
  { label: '绿电占比', en: 'Green Ratio', value: '84.2%' },
  { label: '新能源消纳率', en: 'RE Utilization', value: '83.9%' },
  { label: '度电成本', en: 'LCOE', value: '0.382 元/kWh' },
]

const cards = [
  { value: '150 MW', label: '风电装机' },
  { value: '120 MW', label: '光伏装机' },
  { value: '40 MW / 160 MWh', label: '储能功率 / 容量' },
  { value: '269 MWh', label: '外网购电量' },
  { value: '-128,500 tCO₂', label: '年碳减排量' },
  { value: '85.6 分', label: '友好性综合评分' },
]

function go(path: string) {
  router.push(`/projects/${projectId.value}${path}`)
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="left">
        <button class="back" @click="router.push('/projects')">← 项目列表</button>
        <strong>零碳园区示范项目</strong>
        <span class="muted">运行中</span>
      </div>
      <div class="right">
        <button @click="go('/imports')">数据导入</button>
        <button class="primary" @click="go('/reports')">报告生成</button>
      </div>
    </header>

    <main class="content">
      <!-- KPI 三连 -->
      <section class="kpis">
        <div v-for="k in kpis" :key="k.label" class="kpi">
          <div class="kpi-value">{{ k.value }}</div>
          <div class="kpi-label">{{ k.label }} <span class="muted">{{ k.en }}</span></div>
        </div>
      </section>

      <!-- 图表区（先占位，以后接 ECharts） -->
      <section class="charts">
        <div class="card panel">
          <div class="panel-title">风电出力曲线 <span class="muted">Wind Power Output</span></div>
          <div class="placeholder">图表占位</div>
        </div>

        <div class="card panel">
          <div class="panel-title">光伏出力曲线 <span class="muted">Solar Power Output</span></div>
          <div class="placeholder">图表占位</div>
        </div>

        <div class="card panel big">
          <div class="panel-title">
            源网荷储电力平衡全景 <span class="muted">Power Balance</span>
          </div>
          <div class="placeholder">图表占位（风电/光伏/储能/外网购电 + 负荷）</div>
        </div>

        <div class="card panel">
          <div class="panel-title">
            储能充放电过程 <span class="muted">Battery Charge / Discharge</span>
          </div>
          <div class="placeholder">图表占位（充放电柱 + SOC 曲线）</div>
        </div>

        <div class="card panel">
          <div class="panel-title">
            友好性评价 <span class="muted">Friendship Radar</span>
          </div>
          <div class="placeholder">图表占位（五维雷达 + 指标条）</div>
        </div>
      </section>

      <!-- 底部指标卡 -->
      <section class="cards">
        <div v-for="c in cards" :key="c.label" class="card stat">
          <div class="stat-value">{{ c.value }}</div>
          <div class="stat-label muted">{{ c.label }}</div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.topbar {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0e1729;
  border-bottom: 1px solid #1f2f47;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back {
  padding: 5px 10px;
}

.content {
  padding: 18px 20px 28px;
}

.kpis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.kpi {
  padding: 14px 18px;
  background: #0f1a2c;
  border: 1px solid #1f2f47;
  border-radius: 10px;
}

.kpi-value {
  font-size: 22px;
  color: #5ee0c0;
}

.kpi-label {
  font-size: 12px;
  margin-top: 4px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1.6fr 1fr;
  grid-template-rows: 210px 210px;
  gap: 12px;
}

.panel {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel.big {
  grid-row: span 2;
}

.panel-title {
  font-size: 13px;
  color: #cfe0f7;
  margin-bottom: 6px;
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5f7d;
  font-size: 12px;
  border: 1px dashed #23344e;
  border-radius: 6px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.stat {
  padding: 12px 14px;
}

.stat-value {
  font-size: 16px;
  color: #eaf2ff;
}

.stat-label {
  font-size: 12px;
  margin-top: 4px;
}
</style>
