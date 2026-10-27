<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { useRoute, useRouter } from 'vue-router'

import {
  fetchDay,
  fetchDay15,
  fetchSummary,
  type DashboardDay,
  type DashboardDay15,
  type DashboardSummary,
} from '@/api/dashboard'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const summary = ref<DashboardSummary | null>(null)
const day = ref<DashboardDay | null>(null)
const day15 = ref<DashboardDay15 | null>(null)
const error = ref('')
const loading = ref(true)

const windEl = ref<HTMLDivElement>()
const pvEl = ref<HTMLDivElement>()
const bessEl = ref<HTMLDivElement>()
const balanceEl = ref<HTMLDivElement>()
const exchangeEl = ref<HTMLDivElement>()
const typicalEl = ref<HTMLDivElement>()
const mlEl = ref<HTMLDivElement>()

const charts: Record<string, echarts.ECharts> = {}

const C = {
  wind: '#4a90d9',
  pv: '#f2c31a',
  bess: '#8e6bbf',
  buy: '#e8836a',
  load: '#5ee0c0',
  price: '#f2c31a',
  sell: '#3f5f8f',
  net: '#e8836a',
}

const axis = {
  axisLabel: { color: '#7f90aa', fontSize: 10 },
  axisLine: { lineStyle: { color: '#23344e' } },
}

const yAxisBase = {
  type: 'value' as const,
  nameTextStyle: { color: '#7f90aa' },
  axisLabel: { color: '#7f90aa', fontSize: 10 },
  splitLine: { lineStyle: { color: '#1a2940' } },
}

function optionWind(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 14, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, max: d.wind.capacity },
    series: [
      {
        name: '实际出力',
        type: 'line',
        data: d.wind.actual,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: C.wind, width: 2.2 },
      },
      {
        name: `装机 ${d.wind.capacity} MW`,
        type: 'line',
        data: d.hours.map(() => d.wind.capacity),
        symbol: 'none',
        lineStyle: { color: '#7f90aa', width: 1, type: 'dashed' },
      },
    ],
  } as echarts.EChartsOption
}

function optionPv(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 14, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, max: d.pv.capacity + 10 },
    series: [
      {
        name: '实际出力',
        type: 'line',
        data: d.pv.actual,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: C.pv, width: 2.2 },
      },
      {
        name: `装机 ${d.pv.capacity} MW`,
        type: 'line',
        data: d.hours.map(() => d.pv.capacity),
        symbol: 'none',
        lineStyle: { color: '#7f90aa', width: 1, type: 'dashed' },
      },
    ],
  } as echarts.EChartsOption
}

function optionBess(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 38, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: [
      { ...yAxisBase, name: 'MW' },
      { type: 'value', name: 'SOC', min: 0, max: 1, axisLabel: { color: '#7f90aa', fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '充电',
        type: 'bar',
        data: d.storage.charge.map((v) => -v),
        itemStyle: { color: C.sell },
        barMaxWidth: 12,
      },
      { name: '放电', type: 'bar', data: d.storage.discharge, itemStyle: { color: C.bess }, barMaxWidth: 12 },
      {
        name: 'SOC',
        type: 'line',
        yAxisIndex: 1,
        data: d.storage.soc,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: C.load, width: 2 },
      },
    ],
  } as echarts.EChartsOption
}

function optionBalance(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 11 }, top: 0 },
    grid: { left: 48, right: 24, top: 40, bottom: 26 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, name: 'MW' },
    series: [
      { name: '风电消纳', type: 'bar', stack: 'supply', data: d.balance.wind, itemStyle: { color: C.wind }, barMaxWidth: 20 },
      { name: '光伏消纳', type: 'bar', stack: 'supply', data: d.balance.pv, itemStyle: { color: C.pv }, barMaxWidth: 20 },
      { name: '储能放电', type: 'bar', stack: 'supply', data: d.balance.discharge, itemStyle: { color: C.bess }, barMaxWidth: 20 },
      { name: '外网购电', type: 'bar', stack: 'supply', data: d.balance.buy, itemStyle: { color: C.buy }, barMaxWidth: 20 },
      {
        name: '负荷',
        type: 'line',
        data: d.balance.load,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: C.load, width: 2.5 },
        itemStyle: { color: C.load },
      },
    ],
  } as echarts.EChartsOption
}

function optionExchange(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 44, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: [
      { ...yAxisBase, name: 'MW' },
      { type: 'value', name: '元/kWh', min: 0, max: 1.2, axisLabel: { color: '#7f90aa', fontSize: 10 }, splitLine: { show: false } },
    ],
    series: [
      { name: '外网购电', type: 'bar', data: d.exchange.buy, itemStyle: { color: C.buy }, barMaxWidth: 10 },
      { name: '外网售电', type: 'bar', data: d.exchange.sell.map((v) => -v), itemStyle: { color: C.sell }, barMaxWidth: 10 },
      {
        name: '分时电价',
        type: 'line',
        yAxisIndex: 1,
        data: d.exchange.price,
        step: 'end',
        symbol: 'none',
        lineStyle: { color: C.price, width: 1.6 },
      },
    ],
  } as echarts.EChartsOption
}

function optionTypical(d: DashboardDay15): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#9fb0c9', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 16, top: 28, bottom: 22 },
    xAxis: {
      type: 'category',
      data: d.points.map((p) => p.ts),
      axisLabel: { color: '#7f90aa', fontSize: 9, interval: 7 },
      axisLine: { lineStyle: { color: '#23344e' } },
    },
    yAxis: { ...yAxisBase, name: 'MW' },
    series: [
      {
        name: '光伏可用',
        type: 'line',
        data: d.points.map((p) => p.pv),
        smooth: true,
        symbol: 'none',
        areaStyle: { opacity: 0.12, color: C.pv },
        lineStyle: { color: C.pv, width: 2 },
      },
      { name: '负荷', type: 'line', data: d.points.map((p) => p.load), smooth: true, symbol: 'none', lineStyle: { color: C.load, width: 2.2 } },
      { name: '净负荷', type: 'line', data: d.points.map((p) => p.net), smooth: true, symbol: 'none', lineStyle: { color: C.net, width: 1.6, type: 'dashed' } },
    ],
  } as echarts.EChartsOption
}

function optionMl(d: DashboardDay): echarts.EChartsOption {
  return {
    title: {
      text: '模型待接入',
      left: 'center',
      top: 'middle',
      textStyle: { color: '#4a5f7d', fontSize: 12, fontWeight: 'normal' },
    },
    tooltip: { trigger: 'axis' },
    grid: { left: 42, right: 14, top: 20, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, name: 'MW' },
    series: [
      { name: '实际负荷', type: 'line', data: d.balance.load, smooth: true, symbol: 'none', lineStyle: { color: C.load, width: 2 } },
    ],
  } as echarts.EChartsOption
}

function setChart(el: HTMLDivElement | undefined, option: echarts.EChartsOption, name: string) {
  if (!el) return
  if (!charts[name]) charts[name] = echarts.init(el)
  charts[name].setOption(option, true)
}

function renderCharts() {
  const d = day.value
  if (!d) return
  setChart(windEl.value, optionWind(d), 'wind')
  setChart(pvEl.value, optionPv(d), 'pv')
  setChart(bessEl.value, optionBess(d), 'bess')
  setChart(balanceEl.value, optionBalance(d), 'balance')
  setChart(exchangeEl.value, optionExchange(d), 'exchange')
  setChart(mlEl.value, optionMl(d), 'ml')

  const d15 = day15.value
  if (d15?.available) setChart(typicalEl.value, optionTypical(d15), 'typical')
}

function onResize() {
  Object.values(charts).forEach((c) => c.resize())
}

onMounted(async () => {
  try {
    const [s, d, d15] = await Promise.all([fetchSummary(), fetchDay(), fetchDay15()])
    summary.value = s
    day.value = d
    day15.value = d15
    await nextTick()
    renderCharts()
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  Object.values(charts).forEach((c) => c.dispose())
})

function fmt(v: number | string, unit: string) {
  const n = typeof v === 'number' ? v.toLocaleString('zh-CN', { maximumFractionDigits: 2 }) : v
  if (!unit) return String(n)
  return unit === '%' ? `${n}%` : `${n} ${unit}`
}

function go(path: string) {
  router.push(`/projects/${projectId}${path}`)
}

function backToProjects() {
  router.push('/projects')
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <div class="brand-text">
          <div class="cn">友好型源网荷储一体化规划配置仿真平台</div>
          <div class="en">SOURCE-GRID-LOAD-STORAGE INTEGRATED PLANNING &amp; SIMULATION</div>
        </div>
        <button class="back" title="返回项目列表" @click="backToProjects()">&lt;</button>
      </div>
      <div class="kpis" v-if="summary">
        <div v-for="k in summary.kpi" :key="k.key" class="kpi" :title="k.caliber">
          <b>{{ fmt(k.value, k.unit) }}</b>
          <span>{{ k.label }} · {{ k.en }}</span>
        </div>
      </div>
      <div class="right">
        <div class="meta">
          零碳园区示范项目<br />
          统计期 {{ String(summary?.meta?.data_start || '').slice(0, 10) }} ~ {{ String(summary?.meta?.data_end || '').slice(0, 10) }}
        </div>
        <button @click="go('/imports')">数据导入</button>
        <button class="primary" @click="go('/reports')">报告生成</button>
      </div>
    </header>

    <main class="main">
      <div class="card col1 r1">
        <h3>风电出力曲线 <small>Wind · 装机 {{ day?.wind.capacity }} MW</small></h3>
        <div ref="windEl" class="chart"></div>
      </div>
      <div class="card col1 r2">
        <h3>光伏出力曲线 <small>Solar · 装机 {{ day?.pv.capacity }} MW</small></h3>
        <div ref="pvEl" class="chart"></div>
      </div>
      <div class="card col1 r3">
        <h3>储能充放电过程 <small>Battery · {{ day?.date }}</small></h3>
        <div ref="bessEl" class="chart"></div>
      </div>

      <div class="card col2">
        <h3>源网荷储电力平衡全景 <small>Power Balance · {{ day?.date }}</small></h3>
        <div ref="balanceEl" class="chart"></div>
      </div>

      <div class="card col3 r1">
        <h3>外网交换曲线 <small>Grid Exchange · 购售电 + 分时电价</small></h3>
        <div ref="exchangeEl" class="chart"></div>
      </div>
      <div class="card col3 r2">
        <h3>典型日 15 分钟曲线 <small>Typical Day · 光伏 / 负荷 / 净负荷</small></h3>
        <div v-if="day15?.available" ref="typicalEl" class="chart"></div>
        <div v-else class="empty">该日期没有 15 分钟数据</div>
      </div>
      <div class="card col3 r3">
        <h3>负荷预测 <small>Load Forecast · ML</small></h3>
        <div ref="mlEl" class="chart"></div>
      </div>
    </main>

    <footer class="footer">
      <div class="cards6">
        <div v-for="c in summary?.cards || []" :key="c.key" class="stat">
          <b>{{ fmt(c.value, c.unit) }}</b>
          <span>{{ c.label }}</span>
        </div>
      </div>
      <div class="indbars">
        <div v-for="x in summary?.indicators || []" :key="x.key" class="ind">
          <span>{{ x.label }}</span>
          <div class="bar"><i :style="{ width: Math.min(x.value, 100) + '%' }"></i></div>
          <b>{{ fmt(x.value, x.unit) }}</b>
        </div>
      </div>
    </footer>

    <div v-if="loading" class="mask">加载中…</div>
    <div v-if="error" class="mask error">{{ error }}</div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  box-sizing: border-box;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #1f2f47;
  padding: 0 4px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand .cn {
  font-size: 19px;
  font-weight: 600;
  color: #eaf2ff;
}

.brand .en {
  font-size: 10px;
  color: #7f90aa;
  letter-spacing: 1px;
}

.back {
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1;
}

.kpis {
  display: flex;
  gap: 26px;
}

.kpi {
  text-align: center;
}

.kpi b {
  display: block;
  font-size: 22px;
  color: #5ee0c0;
  font-weight: 600;
}

.kpi span {
  font-size: 10px;
  color: #9fb0c9;
}

.meta {
  text-align: right;
  font-size: 11px;
  color: #7f90aa;
  line-height: 1.6;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 340px 1fr 370px;
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
}

.card {
  background: #101c30;
  border: 1px solid #1f2f47;
  border-radius: 8px;
  padding: 6px 8px 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card h3 {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 600;
  color: #cfe0f7;
}

.card h3 small {
  color: #6f819c;
  font-weight: 400;
  font-size: 9px;
  margin-left: 4px;
}

.chart {
  flex: 1;
  min-height: 0;
}

.col1 {
  grid-column: 1;
}

.col2 {
  grid-column: 2;
  grid-row: 1 / 4;
}

.col3 {
  grid-column: 3;
}

.r1 {
  grid-row: 1;
}

.r2 {
  grid-row: 2;
}

.r3 {
  grid-row: 3;
}

.footer {
  height: 122px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cards6 {
  height: 78px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}

.stat {
  background: #101c30;
  border: 1px solid #1f2f47;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat b {
  font-size: 18px;
  color: #eaf2ff;
}

.stat span {
  font-size: 11px;
  color: #7f90aa;
  margin-top: 3px;
}

.indbars {
  height: 38px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.ind {
  background: #101c30;
  border: 1px solid #1f2f47;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  font-size: 10px;
  color: #9fb0c9;
}

.ind .bar {
  flex: 1;
  height: 6px;
  background: #1a2940;
  border-radius: 3px;
  overflow: hidden;
}

.ind .bar i {
  display: block;
  height: 100%;
  background: #2aa387;
}

.ind b {
  color: #dbe3f0;
  font-size: 10px;
  min-width: 36px;
  text-align: right;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5f7d;
  font-size: 12px;
}

.mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 18, 32, 0.75);
  color: #9fb0c9;
  font-size: 14px;
  z-index: 10;
}

.mask.error {
  color: #ff7a7a;
}
</style>
