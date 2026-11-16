import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { FileText, UploadCloud } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { apiErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { InvoiceUploadInput } from './api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (input: InvoiceUploadInput) => Promise<void>
}

export function InvoiceUploadModal({ open, onOpenChange, onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (accepted) => setFile(accepted[0] ?? null),
  })

  async function submit() {
    if (!file) {
      toast.error('Choose a PDF invoice first')
      return
    }
    setSubmitting(true)
    try {
      await onUpload({
        file,
        vendorName: vendorName || undefined,
        invoiceNumber: invoiceNumber || undefined,
        amount: amount ? Number(amount) : undefined,
      })
      setFile(null)
      setVendorName('')
      setInvoiceNumber('')
      setAmount('')
      onOpenChange(false)
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not upload the invoice'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Upload invoice" description="PDF files up to 10MB.">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
            isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border-subtle)] hover:border-brand-500/60',
          )}
        >
          <input {...getInputProps()} />
          {file ? (
            <>
              <FileText className="text-brand-400" size={28} />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(0)} KB</p>
            </>
          ) : (
            <>
              <UploadCloud className="text-[var(--text-muted)]" size={28} />
              <p className="text-sm text-[var(--text-muted)]">Drag a PDF here, or click to browse</p>
            </>
          )}
        </div>
        <TextField label="Vendor (optional)" placeholder="Acme Corp" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Invoice # (optional)" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <TextField label="Amount (optional)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  )
}
