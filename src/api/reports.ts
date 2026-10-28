import { request } from './http'

// 可选的报告章节，顺序即默认展示顺序
export const REPORT_SECTIONS = [
  { key: 'project', name: '项目概况' },
  { key: 'data', name: '基础数据说明' },
  { key: 'resource', name: '资源条件分析' },
  { key: 'load', name: '负荷特性分析' },
  { key: 'method', name: '建模方法说明' },
  { key: 'capacity', name: '容量优化结果' },
  { key: 'operation', name: '运行仿真结果' },
  { key: 'economy', name: '经济性分析' },
  { key: 'friendliness', name: '友好性评价' },
  { key: 'plan', name: '推荐配置方案' },
  { key: 'risk', name: '风险与建议' },
]

export interface ReportResult {
  filename: string
  markdown: string
}

export function createReport(title: string, sections: string[]) {
  return request<ReportResult>('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ title, sections }),
  })
}
