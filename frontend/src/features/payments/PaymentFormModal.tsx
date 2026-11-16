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
import type { Payment } from '@/types/api'
import type { PaymentInput } from './api'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => Number(v) > 0, 'Must be greater than 0'),
  currency: z.string().min(1),
  dueDate: z.string().min(1, 'Due date is required'),
  categoryId: z.string().optional(),
  recurring: z.boolean(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface PaymentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: PaymentInput) => Promise<void>
  initial?: Payment | null
}

export function PaymentFormModal({ open, onOpenChange, onSubmit, initial }: PaymentFormModalProps) {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'INR', recurring: false },
  })

  useEffect(() => {
    if (open) {
      reset(
        initial
          ? {
              title: initial.title,
              amount: String(initial.amount),
              currency: initial.currency,
              dueDate: initial.dueDate,
              categoryId: initial.categoryId ?? undefined,
              recurring: initial.recurring,
              notes: initial.notes ?? '',
            }
          : { currency: 'INR', recurring: false, dueDate: new Date().toISOString().slice(0, 10) },
      )
    }
  }, [open, initial, reset])

  async function submit(values: FormValues) {
    try {
      await onSubmit({
        title: values.title,
        amount: Number(values.amount),
        currency: values.currency,
        dueDate: values.dueDate,
        categoryId: values.categoryId || null,
        recurring: values.recurring,
        notes: values.notes || null,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not save the payment'))
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={initial ? 'Edit payment' : 'New payment'} description="Track a one-off or recurring bill.">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <TextField label="Title" placeholder="Electricity bill" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Amount" type="number" step="0.01" error={errors.amount?.message} {...register('amount')} />
          <TextField label="Currency" placeholder="INR" error={errors.currency?.message} {...register('currency')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
          <SelectField label="Category" {...register('categoryId')}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-subtle)]" {...register('recurring')} />
          This is a recurring bill
        </label>
        <TextareaField label="Notes (optional)" placeholder="Anything worth remembering..." {...register('notes')} />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {initial ? 'Save changes' : 'Add payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
