import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { IndianRupee, Repeat, CalendarClock, Wallet } from 'lucide-react'
import { fetchCategoryBreakdown, fetchSpendingOverTime, fetchSubscriptionCostTrends, fetchSummary, fetchUpcomingRenewals } from './api'
import { StatTile } from '@/components/ui/StatTile'
import { GlassCard } from '@/components/ui/GlassCard'
import { SpendingAreaChart } from './charts/SpendingAreaChart'
import { CategoryDonutChart } from './charts/CategoryDonutChart'
import { SubscriptionTrendChart } from './charts/SubscriptionTrendChart'
import { UpcomingRenewalsList } from './UpcomingRenewalsList'
import { useAuthStore } from '@/store/auth-store'

export function DashboardPage() {
  const fullName = useAuthStore((s) => s.fullName)
  const currency = 'INR'

  const { data: summary } = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: fetchSummary })
  const { data: spending = [] } = useQuery({ queryKey: ['dashboard', 'spending'], queryFn: () => fetchSpendingOverTime(6) })
  const { data: categories = [] } = useQuery({ queryKey: ['dashboard', 'categories'], queryFn: fetchCategoryBreakdown })
  const { data: subTrend = [] } = useQuery({ queryKey: ['dashboard', 'sub-trend'], queryFn: () => fetchSubscriptionCostTrends(6) })
  const { data: renewals = [] } = useQuery({ queryKey: ['dashboard', 'renewals'], queryFn: fetchUpcomingRenewals })

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-semibold">
          Welcome back, <span className="gradient-text">{fullName?.split(' ')[0] ?? 'there'}</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">Here's what's happening with your money.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Spent this month"
          value={summary?.totalSpendThisMonth ?? 0}
          prefix="₹"
          decimals={0}
          icon={<IndianRupee size={16} />}
          accent="from-brand-500 to-brand-700"
          delay={0}
        />
        <StatTile
          label="Active subscriptions"
          value={summary?.activeSubscriptionsCount ?? 0}
          icon={<Repeat size={16} />}
          accent="from-accent-500 to-accent-600"
          delay={0.05}
        />
        <StatTile
          label="Est. monthly subscription cost"
          value={summary?.estimatedMonthlySubscriptionCost ?? 0}
          prefix="₹"
          icon={<Wallet size={16} />}
          accent="from-fuchsia-500 to-brand-600"
          delay={0.1}
        />
        <StatTile
          label="Renewals in 30 days"
          value={summary?.upcomingRenewalsNext30Days ?? 0}
          icon={<CalendarClock size={16} />}
          accent="from-amber-500 to-rose-500"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" hover={false}>
          <h2 className="mb-1 font-display text-base font-semibold">Spending over time</h2>
          <p className="mb-2 text-xs text-[var(--text-muted)]">Last 6 months of paid bills</p>
          <SpendingAreaChart data={spending} currency={currency} />
        </GlassCard>
        <GlassCard hover={false}>
          <h2 className="mb-1 font-display text-base font-semibold">Spend by category</h2>
          <p className="mb-2 text-xs text-[var(--text-muted)]">This month</p>
          <CategoryDonutChart data={categories} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2" hover={false}>
          <h2 className="mb-1 font-display text-base font-semibold">Subscription cost trend</h2>
          <p className="mb-2 text-xs text-[var(--text-muted)]">Monthly-equivalent cost of active subscriptions</p>
          <SubscriptionTrendChart data={subTrend} currency={currency} />
        </GlassCard>
        <GlassCard hover={false}>
          <h2 className="mb-3 font-display text-base font-semibold">Upcoming renewals</h2>
          <UpcomingRenewalsList renewals={renewals} />
        </GlassCard>
      </div>
    </div>
  )
}
