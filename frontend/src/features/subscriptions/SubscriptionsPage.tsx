import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Ban, Pencil, Plus, Repeat, Trash2 } from 'lucide-react'
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  fetchSubscriptions,
  updateSubscription,
  type SubscriptionInput,
} from './api'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SubscriptionFormModal } from './SubscriptionFormModal'
import { CancelSubscriptionModal } from './CancelSubscriptionModal'
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils'
import type { Subscription, SubscriptionStatus } from '@/types/api'

const statusTone: Record<SubscriptionStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  ACTIVE: 'success',
  CANCELLED: 'neutral',
  PAUSED: 'warning',
  EXPIRED: 'danger',
}

export function SubscriptionsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | undefined>('ACTIVE')
  const [modalOpen, setModalOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null)
  const [editing, setEditing] = useState<Subscription | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions', statusFilter],
    queryFn: () => fetchSubscriptions(statusFilter),
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createMutation = useMutation({ mutationFn: createSubscription, onSuccess: () => { toast.success('Subscription added'); invalidate() } })
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SubscriptionInput }) => updateSubscription(id, input),
    onSuccess: () => { toast.success('Subscription updated'); invalidate() },
  })
  const deleteMutation = useMutation({ mutationFn: deleteSubscription, onSuccess: () => { toast.success('Subscription removed'); invalidate() } })
  const cancelMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof cancelSubscription>[1] }) => cancelSubscription(id, input),
    onSuccess: () => { toast.success('Subscription cancelled'); invalidate() },
  })

  const subscriptions = data?.content ?? []

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-[var(--text-muted)]">Know what's renewing before it hits your card.</p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
        >
          New subscription
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white' : 'glass-panel text-[var(--text-muted)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-[var(--text-muted)]">Loading subscriptions...</p>
      ) : subscriptions.length === 0 ? (
        <GlassCard hover={false}>
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">Nothing here yet. Add a subscription to start tracking it.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {subscriptions.map((sub) => {
              const days = daysUntil(sub.nextRenewalDate)
              return (
                <motion.div key={sub.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <GlassCard className="flex h-full flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                          <Repeat size={16} />
                        </div>
                        <div>
                          <p className="font-medium">{sub.providerName}</p>
                          {sub.planName && <p className="text-xs text-[var(--text-muted)]">{sub.planName}</p>}
                        </div>
                      </div>
                      <Badge tone={statusTone[sub.status]}>{sub.status}</Badge>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold">{formatCurrency(sub.cost, sub.currency)}</p>
                      <p className="text-xs text-[var(--text-muted)]">per {sub.billingCycle.toLowerCase()}</p>
                    </div>
                    {sub.status === 'ACTIVE' && (
                      <p className="text-sm text-[var(--text-muted)]">
                        Renews {formatDate(sub.nextRenewalDate)}{' '}
                        <span className={days <= 3 ? 'font-medium text-rose-400' : ''}>({days <= 0 ? 'today' : `${days}d`})</span>
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      {sub.status === 'ACTIVE' && (
                        <Button size="sm" variant="secondary" icon={<Ban size={14} />} onClick={() => setCancelTarget(sub)}>
                          Cancel
                        </Button>
                      )}
                      <button
                        className="ml-auto rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]"
                        onClick={() => {
                          setEditing(sub)
                          setModalOpen(true)
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => deleteMutation.mutate(sub.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <SubscriptionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) await updateMutation.mutateAsync({ id: editing.id, input })
          else await createMutation.mutateAsync(input)
        }}
      />

      <CancelSubscriptionModal
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        subscription={cancelTarget}
        onConfirm={async (input) => {
          if (cancelTarget) await cancelMutation.mutateAsync({ id: cancelTarget.id, input })
        }}
      />
    </div>
  )
}
