import { request } from './http'

// 一个数据库字段（对应后端 field_dict 的一行）
export interface FieldDef {
  key: string
  name: string
  unit: string
  required: boolean
  sort_order: number
}

// 一类数据类型 + 它的字段（对应后端 data_type + 字段列表）
export interface TypeDef {
  code: string
  name: string
  description: string | null
  fields: FieldDef[]
}

// GET /api/schema/types
export function fetchTypes() {
  return request<TypeDef[]>('/api/schema/types')
}
