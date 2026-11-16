import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

interface WrapperProps {
  label: string
  error?: string
  children: ReactNode
}

function FieldWrapper({ label, error, children }: WrapperProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--text-muted)]">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <input className={cn(fieldBase, className)} {...props} />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function SelectField({ label, error, className, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <select className={cn(fieldBase, className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextareaField({ label, error, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <textarea className={cn(fieldBase, 'min-h-20 resize-y', className)} {...props} />
    </FieldWrapper>
  )
}
