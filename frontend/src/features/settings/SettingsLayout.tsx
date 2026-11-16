import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/integrations', label: 'Integrations' },
]

export function SettingsLayout() {
  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your profile and connected services.</p>
      </div>
      <div className="flex w-fit gap-1 rounded-xl glass-panel p-1">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-gradient-to-r from-brand-600 to-accent-500 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
