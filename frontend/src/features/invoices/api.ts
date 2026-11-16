import { apiClient } from '@/lib/api-client'
import type { Invoice, PageResponse } from '@/types/api'

export interface InvoiceUploadInput {
  file: File
  paymentId?: string
  subscriptionId?: string
  invoiceNumber?: string
  invoiceDate?: string
  amount?: number
  vendorName?: string
}

export async function fetchInvoices(params: { paymentId?: string; subscriptionId?: string; search?: string; page?: number; size?: number } = {}) {
  const { data } = await apiClient.get<PageResponse<Invoice>>('/invoices', { params })
  return data
}

export async function uploadInvoice(input: InvoiceUploadInput) {
  const form = new FormData()
  form.append('file', input.file)
  if (input.paymentId) form.append('paymentId', input.paymentId)
  if (input.subscriptionId) form.append('subscriptionId', input.subscriptionId)
  if (input.invoiceNumber) form.append('invoiceNumber', input.invoiceNumber)
  if (input.invoiceDate) form.append('invoiceDate', input.invoiceDate)
  if (input.amount !== undefined) form.append('amount', String(input.amount))
  if (input.vendorName) form.append('vendorName', input.vendorName)

  const { data } = await apiClient.post<Invoice>('/invoices', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteInvoice(id: string) {
  await apiClient.delete(`/invoices/${id}`)
}

/**
 * Fetches the presigned object-store URL (authenticated, via apiClient), then downloads it in a
 * second, unauthenticated request - the presigned URL carries its own signature-based auth and
 * must not be sent an Authorization header, which can make the object store reject the request.
 */
export async function downloadInvoice(id: string, filename: string) {
  const { data } = await apiClient.get<{ url: string }>(`/invoices/${id}/download`)
  const response = await fetch(data.url)
  if (!response.ok) throw new Error('Failed to download invoice')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}
