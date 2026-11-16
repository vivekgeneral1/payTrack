export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  fullName: string
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  defaultCurrency: string
  timezone: string
}

export interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  isSystem: boolean
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface Payment {
  id: string
  categoryId: string | null
  subscriptionId: string | null
  title: string
  amount: number
  currency: string
  dueDate: string
  paidDate: string | null
  status: PaymentStatus
  recurring: boolean
  recurrenceRule: string | null
  notes: string | null
}

export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED'

export interface Subscription {
  id: string
  categoryId: string | null
  providerName: string
  planName: string | null
  cost: number
  currency: string
  billingCycle: BillingCycle
  customIntervalDays: number | null
  startDate: string
  nextRenewalDate: string
  status: SubscriptionStatus
  autoRenew: boolean
  cancellationUrl: string | null
  cancellationInstructions: string | null
}

export interface Cancellation {
  id: string
  cancelledAt: string
  effectiveDate: string | null
  reason: string | null
  refundAmount: number | null
  notes: string | null
}

export interface Invoice {
  id: string
  paymentId: string | null
  subscriptionId: string | null
  originalFilename: string
  contentType: string
  sizeBytes: number
  invoiceNumber: string | null
  invoiceDate: string | null
  amount: number | null
  vendorName: string | null
  uploadedAt: string
}

export type NotificationType =
  | 'RENEWAL_REMINDER'
  | 'INVOICE_DUE'
  | 'PAYMENT_CONFIRMATION'
  | 'SUBSCRIPTION_CANCELLED'
  | 'PRICE_HIKE_ALERT'
  | 'BUDGET_ALERT'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string | null
  relatedEntityType: 'PAYMENT' | 'SUBSCRIPTION' | null
  relatedEntityId: string | null
  read: boolean
  createdAt: string
}

export interface DashboardSummary {
  totalSpendThisMonth: number
  activeSubscriptionsCount: number
  estimatedMonthlySubscriptionCost: number
  upcomingRenewalsNext30Days: number
  pendingPaymentsCount: number
  totalPendingAmount: number
  cancelledSubscriptionsCount: number
}

export interface TimeSeriesPoint {
  label: string
  amount: number
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  color: string | null
  amount: number
}

export interface UpcomingRenewal {
  subscriptionId: string
  providerName: string
  cost: number
  currency: string
  nextRenewalDate: string
  daysUntil: number
}

export interface RazorpayOrderResponse {
  id: string
  razorpayOrderId: string
  razorpayKeyId: string
  amount: number
  currency: string
  status: string
}
