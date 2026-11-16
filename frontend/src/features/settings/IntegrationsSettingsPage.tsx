import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Calendar, CreditCard, Unlink } from 'lucide-react'
import { disconnectGoogle, fetchGoogleStatus, getGoogleAuthorizationUrl } from '@/features/integrations/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function IntegrationsSettingsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: googleConnected } = useQuery({ queryKey: ['integrations', 'google'], queryFn: fetchGoogleStatus })

  useEffect(() => {
    if (searchParams.get('google') === 'connected') {
      toast.success('Google Calendar connected!')
      queryClient.invalidateQueries({ queryKey: ['integrations', 'google'] })
      searchParams.delete('google')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, queryClient])

  return (
    <div className="max-w-lg space-y-5">
      <GlassCard hover={false}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold">Google Calendar</h2>
              <p className="text-sm text-[var(--text-muted)]">Sync renewal and due dates automatically.</p>
            </div>
          </div>
          <Badge tone={googleConnected ? 'success' : 'neutral'}>{googleConnected ? 'Connected' : 'Not connected'}</Badge>
        </div>
        <div className="mt-4">
          {googleConnected ? (
            <Button
              variant="secondary"
              icon={<Unlink size={16} />}
              onClick={async () => {
                await disconnectGoogle()
                queryClient.invalidateQueries({ queryKey: ['integrations', 'google'] })
                toast.success('Google Calendar disconnected')
              }}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              icon={<Calendar size={16} />}
              onClick={async () => {
                const url = await getGoogleAuthorizationUrl()
                window.location.href = url
              }}
            >
              Connect Google Calendar
            </Button>
          )}
        </div>
      </GlassCard>

      <GlassCard hover={false}>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold">Razorpay</h2>
            <p className="text-sm text-[var(--text-muted)]">Used automatically when you tap "Pay now" on a pending payment.</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-[var(--glass-border)]/50 p-3 text-xs text-[var(--text-muted)]">
          Running in test mode. Configure <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code> and{' '}
          <code>RAZORPAY_WEBHOOK_SECRET</code> on the backend to enable real checkouts.
        </p>
      </GlassCard>
    </div>
  )
}
