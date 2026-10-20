import { request, type AdminInfo } from './http'

export interface LoginResult {
  token: string
  expires_in: number
  admin: AdminInfo
}

export function login(username: string, password: string) {
  return request<LoginResult>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function me() {
  return request<AdminInfo>('/api/auth/me')
}

export function logout() {
  return request<void>('/api/auth/logout', { method: 'POST' })
}
