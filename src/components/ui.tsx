import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuStar, LuX, LuLock, LuUpload } from 'react-icons/lu'
import { Link } from '../lib/router'
import { compressImage } from '../lib/image'
import { toast } from '../lib/toast'

/** Fades + lifts children into view on scroll. */
export function FadeIn({ children, delay = 0, className = '', y = 24 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Page banner with background photo. */
export function PageHeader({ eyebrow, title, subtitle, image }: { eyebrow: string; title: string; subtitle?: string; image: string }) {
  return (
    <section className="relative isolate flex min-h-[44vh] items-end overflow-hidden pt-24 pb-14 md:min-h-[52vh] md:pb-20">
      <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-earth/90 via-earth/50 to-earth/20" />
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-xs font-semibold tracking-[0.25em] text-sand-light uppercase">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-semibold text-cream sm:text-5xl md:text-6xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-base text-cream/85 md:text-lg">{subtitle}</p>}
        </motion.div>
      </div>
    </section>
  )
}

export function Stars({ value, size = 'text-base', onChange }: { value: number; size?: string; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className={`flex items-center gap-0.5 ${size}`} role={onChange ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="p-0.5 transition hover:scale-110"
          >
            <LuStar className={n <= shown ? 'fill-sand text-sand-dark' : 'text-earth/25'} />
          </button>
        ) : (
          <LuStar key={n} className={n <= shown ? 'fill-sand text-sand-dark' : 'text-earth/20'} />
        ),
      )}
    </div>
  )
}

export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-earth/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-lift sm:rounded-3xl sm:p-8 ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">{title}</h2>
              <button onClick={onClose} className="rounded-full p-2 text-xl text-earth-light hover:bg-cream-dark" aria-label="Close">
                <LuX />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SignInPrompt({ action, next }: { action: string; next: string }) {
  return (
    <div className="card flex flex-col items-center gap-4 p-8 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-sand-light/60 text-2xl text-terracotta">
        <LuLock />
      </span>
      <div>
        <h3 className="font-display text-xl font-semibold">Sign in to {action}</h3>
        <p className="mt-1 text-sm text-earth-light">It only takes a minute to create a free guest account.</p>
      </div>
      <Link to={`/login?next=${encodeURIComponent(next)}`} className="btn-primary">
        Log in or sign up
      </Link>
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-earth/15 bg-white/50 px-6 py-14 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sand-light/50 text-3xl text-olive">{icon}</span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {children && <div className="max-w-md text-sm text-earth-light">{children}</div>}
    </div>
  )
}

/** Pick an image from disk (compressed to a data URL) or paste a URL. */
export function ImageInput({ value, onChange, label = 'Photo', maxSize = 1600 }: { value: string; onChange: (v: string) => void; label?: string; maxSize?: number }) {
  const [busy, setBusy] = useState(false)
  const isData = value.startsWith('data:')
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="h-28 w-full shrink-0 overflow-hidden rounded-2xl bg-cream-dark sm:w-40">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="flex-1 space-y-2">
          <label className="btn-ghost cursor-pointer !py-2">
            <LuUpload /> {busy ? 'Processing…' : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                setBusy(true)
                try {
                  onChange(await compressImage(f, maxSize))
                } catch (err) {
                  toast((err as Error).message, 'error')
                } finally {
                  setBusy(false)
                  e.target.value = ''
                }
              }}
            />
          </label>
          <input
            className="input"
            placeholder="…or paste an image URL"
            value={isData ? '' : value}
            onChange={(e) => onChange(e.target.value)}
          />
          {isData && <p className="text-xs text-olive">Using an uploaded image.</p>}
        </div>
      </div>
    </div>
  )
}

export const money = (n: number) => `$${n.toLocaleString('en-US')}`
