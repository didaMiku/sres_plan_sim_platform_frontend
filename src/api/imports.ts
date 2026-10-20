import { request } from './http'

export interface ImportRecordItem {
  id: number
  type_code: string
  original_filename: string
  row_count: number
  status: string
  error_message: string | null
  created_at: string
}

// 当前管理员的导入历史
export function fetchHistory(limit = 20) {
  return request<ImportRecordItem[]>(`/api/imports?limit=${limit}`)
}
