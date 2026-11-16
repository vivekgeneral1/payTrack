import { apiClient } from '@/lib/api-client'

export async function fetchGoogleStatus() {
  const { data } = await apiClient.get<{ connected: boolean }>('/integrations/google/status')
  return data.connected
}

export async function getGoogleAuthorizationUrl() {
  const { data } = await apiClient.get<{ authorizationUrl: string }>('/integrations/google/connect')
  return data.authorizationUrl
}

export async function disconnectGoogle() {
  await apiClient.delete('/integrations/google/disconnect')
}
