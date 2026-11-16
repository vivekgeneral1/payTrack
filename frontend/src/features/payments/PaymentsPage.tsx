import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle2, CreditCard, Pencil, Plus, Trash2 } from 'lucide-react'
import { createPayment, deletePayment, fetchPayments, markPaymentPaid, updatePayment, type PaymentInput } from './api'
import { createRazorpayOrder, loadRazorpayCheckoutScript, openRazorpayCheckout } from '@/features/razorpay/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PaymentFormModal } from './PaymentFormModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { celebrate } from '@/lib/confetti'
import { apiErrorMessage } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'
import type { Payment, PaymentStatus } from '@/types/api'

const statusTone: Record<PaymentStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
  CANCELLED: 'neutral',
}

export function PaymentsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const fullName = useAuthStore((s) => s.fullName)
  const email = useAuthStore((s) => s.email)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', statusFilter],
    queryFn: () => fetchPayments({ status: statusFilter, size: 50 }),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['payments'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment added')
      invalidate()
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentInput }) => updatePayment(id, input),
    onSuccess: () => {
      toast.success('Payment updated')
      invalidate()
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: () => {
      toast.success('Payment removed')
      invalidate()
    },
  })
  const markPaidMutation = useMutation({
    mutationFn: markPaymentPaid,
    onSuccess: () => {
      celebrate()
      toast.success('Marked as paid 🎉')
      invalidate()
    },
  })

  async function handlePayNow(payment: Payment) {
    try {
      const order = await createRazorpayOrder({ amount: payment.amount, currency: payment.currency, paymentId: payment.id })
      const loaded = await loadRazorpayCheckoutScript()
      if (!loaded) {
        toast.error('Could not load Razorpay checkout')
        return
      }
      openRazorpayCheckout({
        key: order.razorpayKeyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        order_id: order.razorpayOrderId,
        name: 'PayTrack',
        description: payment.title,
        prefill: { name: fullName ?? undefined, email: email ?? undefined },
        theme: { color: '#8b5cf6' },
        handler: () => markPaidMutation.mutate(payment.id),
      })
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not start checkout'))
    }
  }

  const payments = data?.content ?? []

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Payments</h1>
          <p className="text-sm text-[var(--text-muted)]">Track and settle every bill in one place.</p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          New payment
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([undefined, 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const).map((s) => (
          <button
            key={s ?? 'ALL'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white' : 'glass-panel text-[var(--text-muted)]'
            }`}
          >
            {s ?? 'All'}
          </button>
        ))}
      </div>

      <GlassCard hover={false} className="p-0">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">No payments yet. Add your first bill above.</p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            <AnimatePresence initial={false}>
              {payments.map((payment) => (
                <motion.li
                  key={payment.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <p className="font-medium">{payment.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Due {formatDate(payment.dueDate)}
                      {payment.paidDate && ` • Paid ${formatDate(payment.paidDate)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-base font-semibold">{formatCurrency(payment.amount, payment.currency)}</span>
                    <Badge tone={statusTone[payment.status]}>{payment.status}</Badge>
                    {payment.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="secondary" icon={<CreditCard size={14} />} onClick={() => handlePayNow(payment)}>
                          Pay now
                        </Button>
                        <Button size="sm" variant="ghost" icon={<CheckCircle2 size={14} />} onClick={() => markPaidMutation.mutate(payment.id)}>
                          Mark paid
                        </Button>
                      </>
                    )}
                    <button
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]"
                      onClick={() => {
                        setEditing(payment)
                        setModalOpen(true)
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => deleteMutation.mutate(payment.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </GlassCard>

      <PaymentFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) await updateMutation.mutateAsync({ id: editing.id, input })
          else await createMutation.mutateAsync(input)
        }}
      />
    </div>
  )
}
