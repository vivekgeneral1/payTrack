import { apiClient } from '@/lib/api-client'
import type { AuthResponse, UserProfile } from '@/types/api'

export async function signup(input: { email: string; password: string; fullName: string }) {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', input)
  return data
}

export async function login(input: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', input)
  return data
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken })
}

export async function fetchMe() {
  const { data } = await apiClient.get<UserProfile>('/users/me')
  return data
}

export async function updateMe(input: Partial<Pick<UserProfile, 'fullName' | 'defaultCurrency' | 'timezone'>>) {
  const { data } = await apiClient.patch<UserProfile>('/users/me', input)
  return data
}
