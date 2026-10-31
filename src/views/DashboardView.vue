<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { useRoute, useRouter } from 'vue-router'

import {
  fetchDay,
  fetchDay15,
  fetchForecast,
  fetchSummary,
  type DashboardDay,
  type DashboardDay15,
  type DashboardForecast,
  type DashboardSummary,
} from '@/api/dashboard'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const summary = ref<DashboardSummary | null>(null)
const day = ref<DashboardDay | null>(null)
const day15 = ref<DashboardDay15 | null>(null)
const forecastData = ref<DashboardForecast | null>(null)
const windForecast = ref<DashboardForecast | null>(null)
const pvForecast = ref<DashboardForecast | null>(null)
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
  wind: '#a03224',
  pv: '#f5a634',
  bess: '#7db8ad',
  buy: '#c1663f',
  load: '#1a1a18',
  price: '#c08a35',
  sell: '#7c9784',
  net: '#8e2e22',
}

const axis = {
  axisLabel: { color: '#4a4842', fontSize: 10 },
  axisLine: { lineStyle: { color: 'rgba(26, 26, 24, 0.35)' } },
}

const yAxisBase = {
  type: 'value' as const,
  nameTextStyle: { color: '#4a4842' },
  axisLabel: { color: '#4a4842', fontSize: 10 },
  splitLine: { lineStyle: { color: 'rgba(26, 26, 24, 0.12)' } },
}

function optionWind(d: DashboardDay, f: DashboardForecast | null): echarts.EChartsOption {
  const series: Record<string, unknown>[] = [
    {
      name: '实际出力',
      type: 'line',
      data: d.wind.actual,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: C.wind, width: 2.2 },
    },
  ]
  if (f) {
    series.push({
      name: '预测出力',
      type: 'line',
      data: f.predicted,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: C.net, width: 1.8, type: 'dashed' },
    })
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 14, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, max: d.wind.capacity },
    series,
  } as echarts.EChartsOption
}

function optionPv(d: DashboardDay, f: DashboardForecast | null): echarts.EChartsOption {
  const series: Record<string, unknown>[] = [
    {
      name: '实际出力',
      type: 'line',
      data: d.pv.actual,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: C.pv, width: 2.2 },
    },
  ]
  if (f) {
    series.push({
      name: '预测出力',
      type: 'line',
      data: f.predicted,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: C.net, width: 1.8, type: 'dashed' },
    })
  }
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 14, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: { ...yAxisBase, max: d.pv.capacity + 10 },
    series,
  } as echarts.EChartsOption
}

function optionBess(d: DashboardDay): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 38, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: [
      { ...yAxisBase, name: 'MW' },
      { type: 'value', name: 'SOC', min: 0, max: 1, axisLabel: { color: '#4a4842', fontSize: 10 }, splitLine: { show: false } },
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
    legend: { textStyle: { color: '#4a4842', fontSize: 11 }, top: 0 },
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
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 44, top: 38, bottom: 22 },
    xAxis: { type: 'category', data: d.hours, ...axis },
    yAxis: [
      { ...yAxisBase, name: 'MW' },
      { type: 'value', min: 0, max: 1.2, axisLabel: { color: '#4a4842', fontSize: 10 }, splitLine: { show: false } },
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
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 16, top: 28, bottom: 22 },
    xAxis: {
      type: 'category',
      data: d.points.map((p) => p.ts),
      axisLabel: { color: '#4a4842', fontSize: 9, interval: 7 },
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

function optionMl(f: DashboardForecast): echarts.EChartsOption {
  return {
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#4a4842', fontSize: 10 }, top: 0 },
    grid: { left: 42, right: 14, top: 28, bottom: 22 },
    xAxis: { type: 'category', data: f.hours, ...axis },
    yAxis: { ...yAxisBase, name: 'MW' },
    series: [
      { name: '实际负荷', type: 'line', data: f.actual, smooth: true, symbol: 'none', lineStyle: { color: C.load, width: 2 } },
      { name: '预测负荷', type: 'line', data: f.predicted, smooth: true, symbol: 'none', lineStyle: { color: C.net, width: 2, type: 'dashed' } },
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
  setChart(windEl.value, optionWind(d, windForecast.value), 'wind')
  setChart(pvEl.value, optionPv(d, pvForecast.value), 'pv')
  setChart(bessEl.value, optionBess(d), 'bess')
  setChart(balanceEl.value, optionBalance(d), 'balance')
  setChart(exchangeEl.value, optionExchange(d), 'exchange')
  if (forecastData.value) setChart(mlEl.value, optionMl(forecastData.value), 'ml')

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

    const date = d.date
    const [lf, wf, pf] = await Promise.all([
      fetchForecast('load', date).catch(() => null),
      fetchForecast('wind', date).catch(() => null),
      fetchForecast('pv', date).catch(() => null),
    ])
    forecastData.value = lf
    windForecast.value = wf
    pvForecast.value = pf
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
        <h3>风电出力曲线 <small>Wind · 装机 {{ day?.wind.capacity }} MW · 预测 MAE {{ windForecast?.metrics.mae }} MW</small></h3>
        <div ref="windEl" class="chart"></div>
      </div>
      <div class="card col1 r2">
        <h3>光伏出力曲线 <small>Solar · 装机 {{ day?.pv.capacity }} MW · 预测 MAE {{ pvForecast?.metrics.mae }} MW</small></h3>
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
        <h3>负荷预测 <small>{{ forecastData?.model }} · MAE {{ forecastData?.metrics.mae }} MW · R² {{ forecastData?.metrics.r2 }}</small></h3>
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
  padding: 12px clamp(18px, 3.4vw, 58px) 14px;
  box-sizing: border-box;
}

.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--rule);
  padding: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand .cn {
  font-family: var(--f-zh);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--ink);
}

.brand .en {
  font-family: var(--f-tech);
  font-size: 8.5px;
  letter-spacing: 0.2em;
  color: var(--ink-4);
}

.back {
  padding: 6px 10px;
  font-size: 13px;
  line-height: 1;
}

.kpis {
  display: flex;
  gap: 30px;
}

.kpi {
  text-align: center;
}

.kpi b {
  display: block;
  font-family: var(--f-display);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.kpi span {
  font-family: var(--f-tech);
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--ink-4);
}

.meta {
  text-align: right;
  font-family: var(--f-tech);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--ink-4);
  line-height: 1.7;
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
  background: var(--paper-hi);
  border: 1px solid var(--rule);
  border-radius: 0;
  padding: 6px 8px 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.card h3 {
  margin: 0 0 2px;
  font-family: var(--f-zh);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--ink-2);
}

.card h3 small {
  font-family: var(--f-tech);
  color: var(--ink-4);
  font-weight: 400;
  font-size: 8.5px;
  margin-left: 4px;
  letter-spacing: 0.1em;
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
  background: var(--paper-hi);
  border: 1px solid var(--rule);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat b {
  font-family: var(--f-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--ink);
}

.stat span {
  font-family: var(--f-tech);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--ink-4);
  margin-top: 3px;
}

.indbars {
  height: 38px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.ind {
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  font-family: var(--f-tech);
  font-size: 9.5px;
  letter-spacing: 0.1em;
  color: var(--ink-3);
}

.ind .bar {
  flex: 1;
  height: 5px;
  background: rgba(26, 26, 24, 0.12);
  border-radius: 0;
  overflow: hidden;
}

.ind .bar i {
  display: block;
  height: 100%;
  background: var(--amber);
}

.ind b {
  font-family: var(--f-display);
  color: var(--ink);
  font-size: 10px;
  min-width: 36px;
  text-align: right;
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-4);
  font-size: 12px;
}

.mask {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(242, 235, 220, 0.82);
  color: var(--ink-3);
  font-family: var(--f-tech);
  font-size: 12px;
  letter-spacing: 0.16em;
  z-index: 10;
}

.mask.error {
  color: var(--red);
}
</style>
