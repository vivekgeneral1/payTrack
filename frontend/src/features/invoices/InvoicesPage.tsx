import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Download, FileText, Plus, Search, Trash2 } from 'lucide-react'
import { deleteInvoice, downloadInvoice, fetchInvoices, uploadInvoice } from './api'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { InvoiceUploadModal } from './InvoiceUploadModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiErrorMessage } from '@/lib/api-client'

export function InvoicesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search],
    queryFn: () => fetchInvoices({ search: search || undefined, size: 50 }),
  })

  const uploadMutation = useMutation({
    mutationFn: uploadInvoice,
    onSuccess: () => {
      toast.success('Invoice uploaded')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      toast.success('Invoice deleted')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
  })

  const invoices = data?.content ?? []

  return (
    <div className="space-y-5 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-[var(--text-muted)]">Every receipt, filed and searchable.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Upload invoice
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename or vendor..."
          className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/40 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-[var(--text-muted)]">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <GlassCard hover={false}>
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">No invoices yet. Upload your first PDF above.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {invoices.map((inv) => (
              <motion.div key={inv.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <GlassCard className="flex h-full flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{inv.vendorName ?? inv.originalFilename}</p>
                      <p className="truncate text-xs text-[var(--text-muted)]">{inv.originalFilename}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {inv.amount != null && <span className="font-semibold">{formatCurrency(inv.amount, 'INR')}</span>}
                    <span className="text-xs text-[var(--text-muted)]">{formatDate(inv.uploadedAt)}</span>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Download size={14} />}
                      onClick={async () => {
                        try {
                          await downloadInvoice(inv.id, inv.originalFilename)
                        } catch (error) {
                          toast.error(apiErrorMessage(error, 'Could not download invoice'))
                        }
                      }}
                    >
                      Download
                    </Button>
                    <button
                      className="ml-auto rounded-lg p-2 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => deleteMutation.mutate(inv.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <InvoiceUploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpload={async (input) => {
          await uploadMutation.mutateAsync(input)
        }}
      />
    </div>
  )
}
