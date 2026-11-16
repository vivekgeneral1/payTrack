import type { ReactNode, MouseEventHandler } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: MouseEventHandler<HTMLDivElement>
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={cn('glass-panel rounded-2xl p-5 shadow-[var(--shadow-glow)]', className)}
      onClick={onClick}
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {children}
    </motion.div>
  )
}
