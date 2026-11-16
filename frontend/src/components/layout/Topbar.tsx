import { Moon, Search, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useUiStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { NotificationBell } from './NotificationBell'

export function Topbar() {
  const { theme, toggle } = useThemeStore()
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen)
  const fullName = useAuthStore((s) => s.fullName)

  const initials = (fullName ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="glass-panel sticky top-4 z-20 mx-4 flex items-center justify-between rounded-2xl px-4 py-3 md:mx-6">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/30 px-3.5 py-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] md:w-72"
      >
        <Search size={16} />
        <span className="hidden md:inline">Search or jump to...</span>
        <kbd className="ml-auto hidden rounded bg-[var(--glass-border)] px-1.5 py-0.5 font-mono text-[11px] md:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-xl p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationBell />
        <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-semibold text-white">
          {initials}
        </div>
      </div>
    </header>
  )
}
