import { request } from './http'

// 顶部 KPI
export interface KpiItem {
  key: string
  label: string
  en: string
  value: number
  unit: string
  caliber: string
}

// 底部指标卡
export interface CardItem {
  key: string
  label: string
  value: number | string
  unit: string
}

// 底部指标条
export interface IndicatorItem {
  key: string
  label: string
  value: number
  unit: string
}

// 仪表盘汇总
export interface DashboardSummary {
  project: Record<string, unknown>
  kpi: KpiItem[]
  cards: CardItem[]
  indicators: IndicatorItem[]
  meta: Record<string, unknown>
}

// 平衡图
export interface BalanceSeries {
  wind: number[]
  pv: number[]
  discharge: number[]
  buy: number[]
  load: number[]
}

export interface RenewableSeries {
  actual: number[]
  capacity: number
}

export interface StorageSeries {
  charge: number[]
  discharge: number[]
  soc: number[]
}

export interface ExchangeSeries {
  buy: number[]
  sell: number[]
  price: number[]
}

// 某一天的 24 点时序
export interface DashboardDay {
  date: string
  hours: string[]
  balance: BalanceSeries
  wind: RenewableSeries
  pv: RenewableSeries
  storage: StorageSeries
  exchange: ExchangeSeries
}

// 15 分钟数据点
export interface Day15Point {
  ts: string
  pv: number
  load: number
  net: number
}

export interface DashboardDay15 {
  date: string
  resolution: string
  available: boolean
  points: Day15Point[]
}

export function fetchSummary() {
  return request<DashboardSummary>('/api/dashboard/summary')
}

export function fetchDay(date?: string) {
  const query = date ? `?date=${date}` : ''
  return request<DashboardDay>(`/api/dashboard/day${query}`)
}

export function fetchDay15(date?: string) {
  const query = date ? `?date=${date}` : ''
  return request<DashboardDay15>(`/api/dashboard/day-15${query}`)
}

// 负荷、风电、光伏的误差指标
export interface ForecastMetrics {
  mae: number
  rmse: number
  mape: number
  r2: number
}

// 某一天的负荷或出力预测
export interface DashboardForecast {
  target: string
  target_name: string
  date: string
  hours: string[]
  actual: number[]
  predicted: number[]
  model: string
  metrics: ForecastMetrics
  train_start: string
  train_end: string
  train_rows: number
  placeholder: boolean
}

export function fetchForecast(target = 'load', date?: string) {
  const params = new URLSearchParams({ target })
  if (date) params.set('date', date)
  return request<DashboardForecast>(`/api/dashboard/forecast?${params.toString()}`)
}
