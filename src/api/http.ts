// 极简请求封装：统一处理 401 / 错误提示 / 204

export interface AdminInfo {
  id: number
  username: string
  display_name: string
  role: string
}

// 未登录（后端返回 401）时抛这个，路由守卫和页面据此跳登录页
export class UnauthorizedError extends Error {
  constructor(message = '未登录') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include', // 带上 Cookie（登录态）
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })

  if (res.status === 401) throw new UnauthorizedError()

  if (!res.ok) {
    let detail: unknown = `HTTP ${res.status}`
    try {
      const body = await res.json()
      detail = body?.detail ?? detail
    } catch {
      /* 响应不是 JSON，忽略 */
    }
    throw new Error(typeof detail === 'string' ? detail : '请求失败')
  }

  if (res.status === 204) return undefined as T // 204 没有响应体
  return (await res.json()) as T
}
