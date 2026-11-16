import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'
import { fetchMe, logout, updateMe } from '@/features/auth/api'
import { GlassCard } from '@/components/ui/GlassCard'
import { TextField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { apiErrorMessage } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'

interface FormValues {
  fullName: string
  defaultCurrency: string
  timezone: string
}

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const clearAuth = useAuthStore((s) => s.clear)
  const { data: profile } = useQuery({ queryKey: ['me'], queryFn: fetchMe })
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>()

  useEffect(() => {
    if (profile) reset({ fullName: profile.fullName, defaultCurrency: profile.defaultCurrency, timezone: profile.timezone })
  }, [profile, reset])

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => toast.success('Profile updated'),
    onError: (error) => toast.error(apiErrorMessage(error)),
  })

  async function handleLogout() {
    try {
      if (refreshToken) await logout(refreshToken)
    } finally {
      clearAuth()
      navigate('/login')
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <GlassCard hover={false}>
        <h2 className="mb-4 font-display text-base font-semibold">Your profile</h2>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => updateMutation.mutate(values))}
        >
          <TextField label="Full name" {...register('fullName')} />
          <TextField label="Email" value={profile?.email ?? ''} disabled />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Default currency" {...register('defaultCurrency')} />
            <TextField label="Timezone" {...register('timezone')} />
          </div>
          <Button type="submit" loading={isSubmitting || updateMutation.isPending}>
            Save changes
          </Button>
        </form>
      </GlassCard>

      <GlassCard hover={false}>
        <h2 className="mb-2 font-display text-base font-semibold">Session</h2>
        <p className="mb-4 text-sm text-[var(--text-muted)]">Sign out of PayTrack on this device.</p>
        <Button variant="danger" icon={<LogOut size={16} />} onClick={handleLogout}>
          Log out
        </Button>
      </GlassCard>
    </div>
  )
}
