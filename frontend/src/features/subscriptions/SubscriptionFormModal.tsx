import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { TextField, SelectField, TextareaField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { fetchCategories } from '@/features/categories/api'
import { apiErrorMessage } from '@/lib/api-client'
import type { Subscription } from '@/types/api'
import type { SubscriptionInput } from './api'

const schema = z.object({
  providerName: z.string().min(1, 'Provider is required'),
  planName: z.string().optional(),
  cost: z
    .string()
    .min(1, 'Cost is required')
    .refine((v) => Number(v) > 0, 'Must be greater than 0'),
  currency: z.string().min(1),
  billingCycle: z.enum(['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']),
  customIntervalDays: z.string().optional(),
  startDate: z.string().min(1),
  nextRenewalDate: z.string().min(1),
  categoryId: z.string().optional(),
  autoRenew: z.boolean(),
  cancellationUrl: z.string().optional(),
  cancellationInstructions: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: SubscriptionInput) => Promise<void>
  initial?: Subscription | null
}

export function SubscriptionFormModal({ open, onOpenChange, onSubmit, initial }: Props) {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR', billingCycle: 'MONTHLY', autoRenew: true },
  })
  const billingCycle = watch('billingCycle')

  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().slice(0, 10)
      reset(
        initial
          ? {
              providerName: initial.providerName,
              planName: initial.planName ?? '',
              cost: String(initial.cost),
              currency: initial.currency,
              billingCycle: initial.billingCycle,
              customIntervalDays: initial.customIntervalDays != null ? String(initial.customIntervalDays) : undefined,
              startDate: initial.startDate,
              nextRenewalDate: initial.nextRenewalDate,
              categoryId: initial.categoryId ?? undefined,
              autoRenew: initial.autoRenew,
              cancellationUrl: initial.cancellationUrl ?? '',
              cancellationInstructions: initial.cancellationInstructions ?? '',
            }
          : { currency: 'INR', billingCycle: 'MONTHLY', autoRenew: true, startDate: today, nextRenewalDate: today },
      )
    }
  }, [open, initial, reset])

  async function submit(values: FormValues) {
    try {
      await onSubmit({
        providerName: values.providerName,
        planName: values.planName || null,
        cost: Number(values.cost),
        currency: values.currency,
        billingCycle: values.billingCycle,
        customIntervalDays: values.billingCycle === 'CUSTOM' && values.customIntervalDays ? Number(values.customIntervalDays) : null,
        startDate: values.startDate,
        nextRenewalDate: values.nextRenewalDate,
        categoryId: values.categoryId || null,
        autoRenew: values.autoRenew,
        cancellationUrl: values.cancellationUrl || null,
        cancellationInstructions: values.cancellationInstructions || null,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not save the subscription'))
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? 'Edit subscription' : 'New subscription'}
      description="Keep track of what renews and when."
    >
      <form onSubmit={handleSubmit(submit)} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <TextField label="Provider" placeholder="Netflix" error={errors.providerName?.message} {...register('providerName')} />
        <TextField label="Plan (optional)" placeholder="Premium" {...register('planName')} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Cost" type="number" step="0.01" error={errors.cost?.message} {...register('cost')} />
          <TextField label="Currency" placeholder="INR" error={errors.currency?.message} {...register('currency')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Billing cycle" {...register('billingCycle')}>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </SelectField>
          {billingCycle === 'CUSTOM' ? (
            <TextField label="Every N days" type="number" {...register('customIntervalDays')} />
          ) : (
            <SelectField label="Category" {...register('categoryId')}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Start date" type="date" error={errors.startDate?.message} {...register('startDate')} />
          <TextField label="Next renewal" type="date" error={errors.nextRenewalDate?.message} {...register('nextRenewalDate')} />
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-subtle)]" {...register('autoRenew')} />
          Auto-renews
        </label>
        <TextField label="Cancellation link (optional)" placeholder="https://provider.com/cancel" {...register('cancellationUrl')} />
        <TextareaField label="Cancellation notes (optional)" placeholder="e.g. must cancel 48h before renewal" {...register('cancellationInstructions')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initial ? 'Save changes' : 'Add subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
