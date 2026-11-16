import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, Repeat, FileText, Bell, Settings, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/payments', label: 'Payments', icon: Receipt },
  { to: '/subscriptions', label: 'Subscriptions', icon: Repeat },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings/profile', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="glass-panel fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-1 rounded-r-2xl p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-600/30">
          <Wallet size={18} />
        </div>
        <span className="font-display text-lg font-semibold">PayTrack</span>
      </div>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-gradient-to-r from-brand-600/20 to-accent-500/20 text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]',
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <div className="mt-auto rounded-xl bg-gradient-to-br from-brand-600/15 to-accent-500/15 p-3 text-xs text-[var(--text-muted)]">
        Press <kbd className="rounded bg-[var(--glass-border)] px-1.5 py-0.5 font-mono">⌘K</kbd> for quick actions
      </div>
    </aside>
  )
}
