import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { TextField, TextareaField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { apiErrorMessage } from '@/lib/api-client'
import type { Subscription } from '@/types/api'

interface FormValues {
  reason: string
  effectiveDate: string
  notes: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription | null
  onConfirm: (input: { reason?: string; effectiveDate?: string; notes?: string }) => Promise<void>
}

export function CancelSubscriptionModal({ open, onOpenChange, subscription, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { effectiveDate: new Date().toISOString().slice(0, 10) } })

  async function submit(values: FormValues) {
    try {
      await onConfirm({ reason: values.reason || undefined, effectiveDate: values.effectiveDate || undefined, notes: values.notes || undefined })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not cancel the subscription'))
    }
  }

  if (!subscription) return null

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Cancel ${subscription.providerName}?`}
      description={
        subscription.cancellationUrl || subscription.cancellationInstructions
          ? 'This stops PayTrack reminders. You may still need to cancel directly with the provider.'
          : 'This marks the subscription as cancelled and stops renewal reminders.'
      }
    >
      {(subscription.cancellationUrl || subscription.cancellationInstructions) && (
        <div className="mb-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-400">
          {subscription.cancellationInstructions && <p>{subscription.cancellationInstructions}</p>}
          {subscription.cancellationUrl && (
            <a href={subscription.cancellationUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block underline">
              Open provider's cancellation page →
            </a>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <TextField label="Effective date" type="date" {...register('effectiveDate')} />
        <TextField label="Reason (optional)" placeholder="Not using it enough" {...register('reason')} />
        <TextareaField label="Notes (optional)" {...register('notes')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Keep subscription
          </Button>
          <Button type="submit" variant="danger" loading={isSubmitting}>
            Confirm cancellation
          </Button>
        </div>
      </form>
    </Modal>
  )
}
