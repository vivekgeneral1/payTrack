import { apiClient } from '@/lib/api-client'
import type { RazorpayOrderResponse } from '@/types/api'

export async function createRazorpayOrder(input: { amount: number; currency: string; paymentId?: string; subscriptionId?: string }) {
  const { data } = await apiClient.post<RazorpayOrderResponse>('/razorpay/orders', input)
  return data
}

export async function getRazorpayOrderStatus(id: string) {
  const { data } = await apiClient.get<RazorpayOrderResponse>(`/razorpay/orders/${id}/status`)
  return data
}

interface RazorpayCheckoutOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string }
  theme?: { color?: string }
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void
  modal?: { ondismiss?: () => void }
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void }
  }
}

export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  const instance = new window.Razorpay(options)
  instance.open()
}
