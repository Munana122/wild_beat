import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuCamera, LuUpload, LuX, LuTrash2, LuImage } from 'react-icons/lu'
import { useDB, update } from '../lib/store'
import { useCurrentUser } from '../lib/auth'
import { compressImage } from '../lib/image'
import { uid } from '../lib/id'
import { toast } from '../lib/toast'
import { PageHeader, SignInPrompt, EmptyState, Modal, FadeIn } from '../components/ui'
import { SubscribeForm } from '../components/SubscribeForm'
import { PHOTO_CATEGORIES, type Photo, type PhotoCategory } from '../lib/types'
import { formatDate } from '../lib/dates'

export default function Gallery() {
  const photos = useDB((db) => db.photos)
  const settings = useDB((db) => db.settings)
  const user = useCurrentUser()
  const [filter, setFilter] = useState<PhotoCategory | 'All'>('All')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewing, setViewing] = useState<Photo | null>(null)

  const sorted = [...photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const shown = filter === 'All' ? sorted : sorted.filter((p) => p.category === filter)

  const remove = (p: Photo) => {
    if (!confirm('Delete this photo?')) return
    update((db) => {
      db.photos = db.photos.filter((x) => x.id !== p.id)
    })
    setViewing(null)
    toast('Photo deleted.')
  }

  return (
    <>
      <PageHeader
        eyebrow="Guest gallery"
        title="Rwanda through our guests’ eyes"
        subtitle="Photos shared by travellers who explored Rwanda with Ilyce. Been on a trip? Add yours!"
        image={settings.heroImage}
      />

      <section className="container-x py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter photos">
            {(['All', ...PHOTO_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={filter === c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${filter === c ? 'bg-earth text-cream' : 'bg-white text-earth-light shadow-soft hover:text-terracotta'}`}
              >
                {c}
                {c !== 'All' && <span className="ml-1.5 opacity-60">{photos.filter((p) => p.category === c).length}</span>}
              </button>
            ))}
          </div>
          {user && (
            <button onClick={() => setUploadOpen(true)} className="btn-primary">
              <LuUpload /> Upload a photo
            </button>
          )}
        </div>

        {!user && (
          <FadeIn className="mb-10">
            <SignInPrompt action="share your trip photos" next="/gallery" />
          </FadeIn>
        )}

        {shown.length === 0 ? (
          <EmptyState icon={<LuCamera />} title={photos.length === 0 ? 'The gallery is waiting for its first photo' : `No ${filter.toLowerCase()} photos yet`}>
            {user ? 'Share a favourite moment from your trip — it will appear here straight away.' : 'Sign in to be the first to share a moment from your Rwandan adventure.'}
          </EmptyState>
        ) : (
          <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            <AnimatePresence>
              {shown.map((p) => (
                <motion.button
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setViewing(p)}
                  className="group relative mb-5 block w-full overflow-hidden rounded-3xl shadow-soft break-inside-avoid"
                >
                  <img src={p.src} alt={p.caption || `${p.category} photo by ${p.name}`} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-earth/85 to-transparent p-4 pt-12 text-left text-cream opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-semibold text-earth">{p.category}</span>
                    {p.caption && <p className="mt-2 text-sm font-medium">{p.caption}</p>}
                    <p className="text-xs text-cream/75">by {p.name}</p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <div className="mt-16 grid items-center gap-6 rounded-3xl bg-olive-dark p-8 text-cream md:grid-cols-2 md:p-10">
          <div>
            <h2 className="font-display text-3xl font-semibold">Get new photos by email</h2>
            <p className="mt-2 text-cream/75">Be the first to see new guest photos and hear about upcoming tour dates.</p>
          </div>
          <SubscribeForm dark defaultTopics={['gallery']} />
        </div>
      </section>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <AnimatePresence>
        {viewing && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-earth/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewing(null)}
          >
            <button className="absolute top-4 right-4 rounded-full bg-cream/10 p-3 text-2xl text-cream" aria-label="Close">
              <LuX />
            </button>
            <motion.figure initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <img src={viewing.src} alt={viewing.caption} className="max-h-[78vh] w-auto rounded-2xl object-contain" />
              <figcaption className="mt-3 flex flex-wrap items-center gap-3 text-cream">
                <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-earth">{viewing.category}</span>
                <span className="text-sm">{viewing.caption}</span>
                <span className="text-xs text-cream/60">
                  by {viewing.name} · {formatDate(viewing.createdAt.slice(0, 10))}
                </span>
                {user && (user.id === viewing.userId || user.role === 'admin') && (
                  <button onClick={() => remove(viewing)} className="ml-auto flex items-center gap-1.5 text-sm text-cream/70 hover:text-sand">
                    <LuTrash2 /> Delete
                  </button>
                )}
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useCurrentUser()
  const [src, setSrc] = useState('')
  const [category, setCategory] = useState<PhotoCategory>('Wildlife')
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)

  const pick = async (f?: File) => {
    if (!f) return
    setBusy(true)
    try {
      setSrc(await compressImage(f, 1400, 0.78))
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!src) return toast('Please choose a photo first.', 'error')
    try {
      update((db) => {
        db.photos.push({ id: uid(), userId: user.id, name: user.name, src, category, caption: caption.trim(), createdAt: new Date().toISOString() })
      })
      toast('Your photo is now in the gallery! 📸')
      setSrc('')
      setCaption('')
      onClose()
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Share a trip photo">
      <form onSubmit={submit} className="space-y-5">
        <label
          className="relative flex aspect-[16/10] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-earth/20 bg-white text-center text-earth-light transition hover:border-terracotta"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            pick(e.dataTransfer.files?.[0])
          }}
        >
          {src ? (
            <img src={src} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <LuImage className="text-4xl text-sand-dark" />
              <span className="mt-2 text-sm font-medium">{busy ? 'Preparing photo…' : 'Tap to choose or drop a photo'}</span>
            </>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <div>
          <span className="label">Category</span>
          <div className="grid grid-cols-3 gap-2">
            {PHOTO_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-xl border-2 py-2.5 text-sm font-medium transition ${category === c ? 'border-terracotta bg-terracotta/5 text-terracotta' : 'border-earth/10'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="g-cap">Caption (optional)</label>
          <input id="g-cap" className="input" maxLength={120} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Silverback in the bamboo, Volcanoes NP" />
        </div>
        <button className="btn-primary w-full" disabled={busy || !src}>
          <LuUpload /> Post to gallery
        </button>
      </form>
    </Modal>
  )
}
