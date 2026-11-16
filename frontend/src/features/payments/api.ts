import { apiClient } from '@/lib/api-client'
import type { PageResponse, Payment, PaymentStatus } from '@/types/api'

export interface PaymentInput {
  categoryId?: string | null
  subscriptionId?: string | null
  title: string
  amount: number
  currency: string
  dueDate: string
  recurring: boolean
  recurrenceRule?: string | null
  notes?: string | null
}

export interface PaymentFilters {
  status?: PaymentStatus
  categoryId?: string
  from?: string
  to?: string
  page?: number
  size?: number
}

export async function fetchPayments(filters: PaymentFilters = {}) {
  const { data } = await apiClient.get<PageResponse<Payment>>('/payments', { params: filters })
  return data
}

export async function createPayment(input: PaymentInput) {
  const { data } = await apiClient.post<Payment>('/payments', input)
  return data
}

export async function updatePayment(id: string, input: PaymentInput) {
  const { data } = await apiClient.put<Payment>(`/payments/${id}`, input)
  return data
}

export async function deletePayment(id: string) {
  await apiClient.delete(`/payments/${id}`)
}

export async function markPaymentPaid(id: string) {
  const { data } = await apiClient.post<Payment>(`/payments/${id}/mark-paid`)
  return data
}
