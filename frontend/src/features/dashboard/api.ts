import { apiClient } from '@/lib/api-client'
import type { CategoryBreakdown, DashboardSummary, TimeSeriesPoint, UpcomingRenewal } from '@/types/api'

export async function fetchSummary() {
  const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary')
  return data
}

export async function fetchSpendingOverTime(months = 6) {
  const { data } = await apiClient.get<TimeSeriesPoint[]>('/dashboard/spending-over-time', { params: { months } })
  return data
}

export async function fetchCategoryBreakdown() {
  const { data } = await apiClient.get<CategoryBreakdown[]>('/dashboard/category-breakdown')
  return data
}

export async function fetchSubscriptionCostTrends(months = 6) {
  const { data } = await apiClient.get<TimeSeriesPoint[]>('/dashboard/subscription-cost-trends', { params: { months } })
  return data
}

export async function fetchUpcomingRenewals() {
  const { data } = await apiClient.get<UpcomingRenewal[]>('/dashboard/upcoming-renewals')
  return data
}
