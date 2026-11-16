import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Bell } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchNotifications, fetchUnreadCount, markNotificationRead } from '@/features/notifications/api'
import { formatDate } from '@/lib/utils'

export function NotificationBell() {
  const queryClient = useQueryClient()
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  })
  const { data } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => fetchNotifications(0, 6),
  })

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="relative rounded-xl p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--glass-border)] hover:text-[var(--text-primary)]">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="glass-panel z-50 w-80 rounded-2xl p-2 shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-sm font-semibold">Notifications</span>
            <Link to="/notifications" className="text-xs text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          {!data || data.content.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-[var(--text-muted)]">You're all caught up ✨</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {data.content.map((n) => (
                <button
                  key={n.id}
                  onClick={async () => {
                    if (!n.read) {
                      await markNotificationRead(n.id)
                      queryClient.invalidateQueries({ queryKey: ['notifications'] })
                    }
                  }}
                  className="block w-full rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--glass-border)]"
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                    <div className={n.read ? 'ml-3.5' : ''}>
                      <p className="text-sm font-medium leading-snug">{n.title}</p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
