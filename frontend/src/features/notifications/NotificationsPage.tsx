import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from './api'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { NotificationType } from '@/types/api'

const typeTone: Record<NotificationType, 'neutral' | 'success' | 'warning' | 'danger' | 'brand'> = {
  RENEWAL_REMINDER: 'warning',
  INVOICE_DUE: 'warning',
  PAYMENT_CONFIRMATION: 'success',
  SUBSCRIPTION_CANCELLED: 'neutral',
  PRICE_HIKE_ALERT: 'danger',
  BUDGET_ALERT: 'danger',
}

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: ['notifications', 'full'], queryFn: () => fetchNotifications(0, 50) })
  const notifications = data?.content ?? []

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-[var(--text-muted)]">Renewal reminders, dues, and confirmations.</p>
        </div>
        <Button
          variant="secondary"
          icon={<CheckCheck size={16} />}
          onClick={async () => {
            await markAllNotificationsRead()
            invalidate()
          }}
        >
          Mark all read
        </Button>
      </div>

      <GlassCard hover={false} className="p-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-[var(--text-muted)]">
            <Bell size={28} />
            <p className="text-sm">You're all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {notifications.map((n, i) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 px-5 py-4"
              >
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                <div className={n.read ? 'ml-5 flex-1' : 'flex-1'}>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    <Badge tone={typeTone[n.type]}>{n.type.replaceAll('_', ' ')}</Badge>
                  </div>
                  {n.body && <p className="mt-1 text-sm text-[var(--text-muted)]">{n.body}</p>}
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDate(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    className="text-xs font-medium text-brand-400 hover:underline"
                    onClick={async () => {
                      await markNotificationRead(n.id)
                      invalidate()
                    }}
                  >
                    Mark read
                  </button>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}
