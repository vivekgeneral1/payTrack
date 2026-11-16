import { apiClient } from '@/lib/api-client'
import type { AppNotification, PageResponse } from '@/types/api'

export async function fetchNotifications(page = 0, size = 20) {
  const { data } = await apiClient.get<PageResponse<AppNotification>>('/notifications', { params: { page, size } })
  return data
}

export async function fetchUnreadCount() {
  const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count')
  return data.count
}

export async function markNotificationRead(id: string) {
  await apiClient.patch(`/notifications/${id}/read`)
}

export async function markAllNotificationsRead() {
  await apiClient.patch('/notifications/read-all')
}
