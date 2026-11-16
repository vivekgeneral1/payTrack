import { motion } from 'framer-motion'
import type { UpcomingRenewal } from '@/types/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

function urgencyTone(days: number): 'danger' | 'warning' | 'success' {
  if (days <= 2) return 'danger'
  if (days <= 7) return 'warning'
  return 'success'
}

export function UpcomingRenewalsList({ renewals }: { renewals: UpcomingRenewal[] }) {
  if (renewals.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">No upcoming renewals. Enjoy the quiet 🎉</p>
  }

  return (
    <ul className="space-y-2">
      {renewals.slice(0, 6).map((renewal, index) => (
        <motion.li
          key={renewal.subscriptionId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between rounded-xl bg-[var(--glass-border)]/40 px-3.5 py-3"
        >
          <div>
            <p className="text-sm font-medium">{renewal.providerName}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatDate(renewal.nextRenewalDate)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatCurrency(renewal.cost, renewal.currency)}</span>
            <Badge tone={urgencyTone(renewal.daysUntil)}>
              {renewal.daysUntil <= 0 ? 'Today' : `${renewal.daysUntil}d`}
            </Badge>
          </div>
        </motion.li>
      ))}
    </ul>
  )
}
