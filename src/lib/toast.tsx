import { useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuCircleCheck, LuCircleAlert } from 'react-icons/lu'

type Toast = { id: number; message: string; kind: 'success' | 'error' }
let toasts: Toast[] = []
const listeners = new Set<() => void>()
let next = 1

export function toast(message: string, kind: Toast['kind'] = 'success') {
  const t = { id: next++, message, kind }
  toasts = [...toasts, t]
  listeners.forEach((l) => l())
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id)
    listeners.forEach((l) => l())
  }, 4000)
}

export function Toaster() {
  const list = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
  )
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {list.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium shadow-lift ${
              t.kind === 'success' ? 'bg-olive-dark text-cream' : 'bg-terracotta-dark text-cream'
            }`}
          >
            {t.kind === 'success' ? <LuCircleCheck className="shrink-0 text-lg" /> : <LuCircleAlert className="shrink-0 text-lg" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
