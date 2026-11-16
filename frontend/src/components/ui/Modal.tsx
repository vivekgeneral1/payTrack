import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                className="glass-panel fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg rounded-2xl p-6 shadow-2xl"
                initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-46%' }}
                animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-46%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <Dialog.Title className="font-display text-lg font-semibold">{title}</Dialog.Title>
                    {description && <Dialog.Description className="mt-1 text-sm text-[var(--text-muted)]">{description}</Dialog.Description>}
                  </div>
                  <Dialog.Close className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--glass-border)]">
                    <X size={18} />
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
