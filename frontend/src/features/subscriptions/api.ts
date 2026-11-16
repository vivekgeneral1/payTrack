import { apiClient } from '@/lib/api-client'
import type { BillingCycle, Cancellation, PageResponse, Subscription, SubscriptionStatus } from '@/types/api'

export interface SubscriptionInput {
  categoryId?: string | null
  providerName: string
  planName?: string | null
  cost: number
  currency: string
  billingCycle: BillingCycle
  customIntervalDays?: number | null
  startDate: string
  nextRenewalDate: string
  autoRenew: boolean
  cancellationUrl?: string | null
  cancellationInstructions?: string | null
}

export async function fetchSubscriptions(status?: SubscriptionStatus, page = 0, size = 50) {
  const { data } = await apiClient.get<PageResponse<Subscription>>('/subscriptions', { params: { status, page, size } })
  return data
}

export async function createSubscription(input: SubscriptionInput) {
  const { data } = await apiClient.post<Subscription>('/subscriptions', input)
  return data
}

export async function updateSubscription(id: string, input: SubscriptionInput) {
  const { data } = await apiClient.put<Subscription>(`/subscriptions/${id}`, input)
  return data
}

export async function deleteSubscription(id: string) {
  await apiClient.delete(`/subscriptions/${id}`)
}

export async function cancelSubscription(
  id: string,
  input: { reason?: string; effectiveDate?: string; refundAmount?: number; notes?: string },
) {
  const { data } = await apiClient.post<Subscription>(`/subscriptions/${id}/cancel`, input)
  return data
}

export async function fetchCancellationHistory(id: string) {
  const { data } = await apiClient.get<Cancellation[]>(`/subscriptions/${id}/cancellations`)
  return data
}
