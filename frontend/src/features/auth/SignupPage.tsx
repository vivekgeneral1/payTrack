import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'
import { signup } from './api'
import { useAuthStore } from '@/store/auth-store'
import { GlassCard } from '@/components/ui/GlassCard'
import { TextField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { apiErrorMessage } from '@/lib/api-client'
import { BackgroundMesh } from '@/components/layout/BackgroundMesh'

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
type FormValues = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const session = await signup(values)
      setSession(session)
      toast.success('Account created — welcome to PayTrack!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not create your account'))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <BackgroundMesh />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-600/30">
            <Wallet size={22} />
          </div>
          <h1 className="font-display text-2xl font-semibold">
            Create your <span className="gradient-text">PayTrack</span> account
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Track payments, subscriptions, and invoices in one place.</p>
        </div>
        <GlassCard hover={false}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextField label="Full name" placeholder="Ada Lovelace" error={errors.fullName?.message} {...register('fullName')} />
            <TextField label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <TextField label="Password" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>
        </GlassCard>
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
