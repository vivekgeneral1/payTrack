import type { ReactNode } from 'react'
import CountUpModule from 'react-countup'
import { motion } from 'framer-motion'
import { GlassCard } from './GlassCard'
import { cn } from '@/lib/utils'

// Vite's CJS→ESM interop for react-countup's UMD build sometimes yields the whole
// exports object (not just the CountUp component) as the default import - unwrap defensively.
const CountUp = ((CountUpModule as unknown as { default?: typeof CountUpModule }).default ??
  CountUpModule) as typeof CountUpModule

interface StatTileProps {
  label: string
  value: number
  prefix?: string
  decimals?: number
  icon?: ReactNode
  accent?: string
  suffix?: string
  delay?: number
}

export function StatTile({ label, value, prefix, decimals = 0, icon, accent = 'from-brand-500 to-accent-500', suffix, delay = 0 }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
    >
      <GlassCard className="relative overflow-hidden">
        <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl', accent)} />
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-[var(--text-muted)]">{label}</p>
          {icon && <div className={cn('rounded-lg bg-gradient-to-br p-2 text-white', accent)}>{icon}</div>}
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
          <CountUp end={value} duration={1.1} decimals={decimals} prefix={prefix} suffix={suffix} separator="," />
        </p>
      </GlassCard>
    </motion.div>
  )
}
