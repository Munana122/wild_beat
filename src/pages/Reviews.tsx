import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { LuMessageSquare, LuQuote, LuTrash2 } from 'react-icons/lu'
import { useDB, update } from '../lib/store'
import { useCurrentUser } from '../lib/auth'
import { uid } from '../lib/id'
import { toast } from '../lib/toast'
import { formatDate } from '../lib/dates'
import { PageHeader, Stars, SignInPrompt, EmptyState } from '../components/ui'

export default function Reviews() {
  const reviews = useDB((db) => db.reviews)
  const tours = useDB((db) => db.tours)
  const settings = useDB((db) => db.settings)
  const user = useCurrentUser()
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }))

  return (
    <>
      <PageHeader eyebrow="Guest reviews" title="What travellers say" subtitle="Honest words from families, couples and solo adventurers who explored Rwanda with Ilyce." image={tours[2]?.image ?? settings.heroImage} />

      <section className="container-x grid gap-10 py-12 md:py-16 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="card p-7">
            <p className="font-display text-5xl font-semibold">{reviews.length ? avg.toFixed(1) : '—'}</p>
            <Stars value={Math.round(avg)} size="text-lg" />
            <p className="mt-1 text-sm text-earth-light">
              {reviews.length} review{reviews.length === 1 ? '' : 's'}
            </p>
            <div className="mt-5 space-y-2">
              {counts.map(({ n, c }) => (
                <div key={n} className="flex items-center gap-3 text-xs">
                  <span className="w-3">{n}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-dark">
                    <motion.div
                      className="h-full rounded-full bg-sand-dark"
                      initial={{ width: 0 }}
                      animate={{ width: reviews.length ? `${(c / reviews.length) * 100}%` : 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="w-5 text-right text-earth/60">{c}</span>
                </div>
              ))}
            </div>
          </div>
          {user ? <ReviewForm /> : <SignInPrompt action="write a review" next="/reviews" />}
        </aside>

        <div>
          {sorted.length === 0 ? (
            <EmptyState icon={<LuMessageSquare />} title="No reviews yet">
              Travelled with Ilyce? Be the first to share your experience and help others plan their trip.
            </EmptyState>
          ) : (
            <div className="space-y-5">
              {sorted.map((r, i) => (
                <motion.article
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i, 4) * 0.05 }}
                  className="card relative p-6 md:p-7"
                >
                  <LuQuote className="absolute top-6 right-6 text-4xl text-sand-light" />
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-olive font-display text-lg text-cream">{r.name.charAt(0).toUpperCase()}</span>
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-earth/60">
                        {tours.find((t) => t.id === r.tourId)?.title ?? 'General review'} · {formatDate(r.createdAt.slice(0, 10))}
                      </p>
                    </div>
                  </div>
                  <Stars value={r.rating} size="mt-4 text-sm" />
                  <p className="mt-2 leading-relaxed whitespace-pre-line text-earth-light">{r.text}</p>
                  {user && (user.id === r.userId || user.role === 'admin') && (
                    <button
                      onClick={() => {
                        if (!confirm('Delete this review?')) return
                        update((db) => {
                          db.reviews = db.reviews.filter((x) => x.id !== r.id)
                        })
                        toast('Review deleted.')
                      }}
                      className="mt-4 flex items-center gap-1.5 text-xs text-earth/50 hover:text-terracotta"
                    >
                      <LuTrash2 /> Delete
                    </button>
                  )}
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function ReviewForm() {
  const user = useCurrentUser()!
  const tours = useDB((db) => db.tours)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [tourId, setTourId] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 10) return toast('Please write at least a sentence or two.', 'error')
    update((db) => {
      db.reviews.push({ id: uid(), userId: user.id, name: user.name, rating, text: text.trim(), tourId: tourId || null, createdAt: new Date().toISOString() })
    })
    setText('')
    setTourId('')
    setRating(5)
    toast('Thank you for your review! 💛')
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-7">
      <h2 className="font-display text-2xl font-semibold">Write a review</h2>
      <div>
        <span className="label">Your rating</span>
        <Stars value={rating} onChange={setRating} size="text-2xl" />
      </div>
      <div>
        <label className="label" htmlFor="r-tour">Which tour? (optional)</label>
        <select id="r-tour" className="input" value={tourId} onChange={(e) => setTourId(e.target.value)}>
          <option value="">General / not listed</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="r-text">Your review</label>
        <textarea id="r-text" rows={5} className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you love about your trip with Ilyce?" />
      </div>
      <p className="text-xs text-earth/60">Posting as {user.name}</p>
      <button className="btn-primary w-full">Post review</button>
    </form>
  )
}
