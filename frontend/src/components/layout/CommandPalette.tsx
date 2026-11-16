import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutDashboard, Receipt, Repeat, FileText, Bell, Settings, Moon, Sun } from 'lucide-react'
import { useUiStore } from '@/store/ui-store'
import { useThemeStore } from '@/store/theme-store'

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen)
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen)
  const navigate = useNavigate()
  const { theme, toggle } = useThemeStore()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!open)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, setOpen])

  function go(path: string) {
    navigate(path)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="fixed left-1/2 top-28 z-50 w-[92vw] max-w-lg -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            <Command className="glass-panel overflow-hidden rounded-2xl shadow-2xl" label="Command Menu">
              <Command.Input
                autoFocus
                placeholder="Jump to... or search an action"
                className="w-full border-b border-[var(--border-subtle)] bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-[var(--text-muted)]"
              />
              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">No results found.</Command.Empty>
                <Command.Group heading="Navigate" className="px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                  <Command.Item
                    onSelect={() => go('/dashboard')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Command.Item>
                  <Command.Item
                    onSelect={() => go('/payments')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <Receipt size={16} /> Payments
                  </Command.Item>
                  <Command.Item
                    onSelect={() => go('/subscriptions')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <Repeat size={16} /> Subscriptions
                  </Command.Item>
                  <Command.Item
                    onSelect={() => go('/invoices')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <FileText size={16} /> Invoices
                  </Command.Item>
                  <Command.Item
                    onSelect={() => go('/notifications')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <Bell size={16} /> Notifications
                  </Command.Item>
                  <Command.Item
                    onSelect={() => go('/settings/profile')}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    <Settings size={16} /> Settings
                  </Command.Item>
                </Command.Group>
                <Command.Group heading="Actions" className="px-2 py-1 text-xs font-medium text-[var(--text-muted)]">
                  <Command.Item
                    onSelect={() => {
                      toggle()
                      setOpen(false)
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm data-[selected=true]:bg-[var(--glass-border)]"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} Toggle theme
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
