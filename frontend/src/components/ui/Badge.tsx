import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'brand'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-[var(--glass-border)] text-[var(--text-muted)]',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  brand: 'bg-brand-500/15 text-brand-400',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[tone])}>
      {children}
    </span>
  )
}
