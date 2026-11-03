import { useState, type FormEvent } from 'react'
import { LuPlus, LuPencil, LuTrash2, LuArrowLeft, LuX, LuStar, LuExternalLink } from 'react-icons/lu'
import { useDB, update, getDB } from '../../lib/store'
import { uid, slugify } from '../../lib/id'
import { toast } from '../../lib/toast'
import { Link } from '../../lib/router'
import { ImageInput, money } from '../../components/ui'
import type { Tour } from '../../lib/types'
import { AdminTitle } from './Admin'

const blank = (): Tour => ({
  id: '',
  slug: '',
  title: '',
  tagline: '',
  description: '',
  price: 0,
  duration: '1 day',
  location: '',
  groupSize: '1–6 guests',
  image: '',
  highlights: [],
  itinerary: [{ title: '', description: '' }],
  featured: false,
})

export default function ToursAdmin() {
  const tours = useDB((db) => db.tours)
  const [editing, setEditing] = useState<Tour | null>(null)

  if (editing) return <TourForm initial={editing} onDone={() => setEditing(null)} />

  const remove = (t: Tour) => {
    const n = getDB().bookings.filter((b) => b.tourId === t.id).length
    if (!confirm(`Delete “${t.title}”?${n ? ` It has ${n} booking(s), which will stay in your bookings list.` : ''}`)) return
    update((db) => {
      db.tours = db.tours.filter((x) => x.id !== t.id)
      db.slots = db.slots.map((s) => (s.tourId === t.id ? { ...s, tourId: null } : s))
    })
    toast('Tour deleted.')
  }

  return (
    <>
      <AdminTitle
        title="Tours"
        subtitle="Add, edit and remove the tours shown on your website."
        action={
          <button className="btn-primary" onClick={() => setEditing(blank())}>
            <LuPlus /> New tour
          </button>
        }
      />
      <div className="grid gap-4">
        {tours.map((t) => (
          <div key={t.id} className="card flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center">
            <img src={t.image} alt="" className="h-40 w-full object-cover sm:h-28 sm:w-44" />
            <div className="min-w-0 flex-1 px-5 sm:px-0">
              <p className="flex items-center gap-2 font-display text-lg font-semibold">
                {t.title} {t.featured && <LuStar className="fill-sand text-sand-dark" title="Featured on home page" />}
              </p>
              <p className="text-sm text-earth-light">
                {money(t.price)} · {t.duration} · {t.location}
              </p>
              <p className="text-xs text-earth/50">
                {t.highlights.length} highlights · {t.itinerary.length}-day plan
              </p>
            </div>
            <div className="flex gap-2 px-5 pb-5 sm:pr-5 sm:pb-0 sm:pl-0">
              <Link to={`/tours/${t.slug}`} className="btn-ghost !px-3 !py-2" aria-label="View">
                <LuExternalLink />
              </Link>
              <button className="btn-ghost !px-4 !py-2" onClick={() => setEditing(t)}>
                <LuPencil /> Edit
              </button>
              <button className="btn-ghost !px-3 !py-2 hover:!border-terracotta hover:!text-terracotta" onClick={() => remove(t)} aria-label="Delete">
                <LuTrash2 />
              </button>
            </div>
          </div>
        ))}
        {tours.length === 0 && <p className="card p-6 text-sm text-earth-light">No tours yet. Click “New tour” to add one.</p>}
      </div>
    </>
  )
}

function TourForm({ initial, onDone }: { initial: Tour; onDone: () => void }) {
  const [t, setT] = useState<Tour>(initial)
  const [highlights, setHighlights] = useState(initial.highlights.join('\n'))
  const isNew = !initial.id
  const set = <K extends keyof Tour>(k: K, v: Tour[K]) => setT((x) => ({ ...x, [k]: v }))

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!t.title.trim()) return toast('Please give the tour a title.', 'error')
    if (!t.image) return toast('Please add a photo for the tour.', 'error')
    const base = slugify(t.title) || 'tour'
    const taken = new Set(getDB().tours.filter((x) => x.id !== t.id).map((x) => x.slug))
    let slug = base
    for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`
    const tour: Tour = {
      ...t,
      id: t.id || uid(),
      slug,
      title: t.title.trim(),
      price: Number(t.price) || 0,
      highlights: highlights
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean),
      itinerary: t.itinerary.filter((d) => d.title.trim() || d.description.trim()),
    }
    try {
      update((db) => {
        const i = db.tours.findIndex((x) => x.id === tour.id)
        if (i >= 0) db.tours[i] = tour
        else db.tours.push(tour)
      })
      toast(isNew ? 'Tour added.' : 'Tour saved.')
      onDone()
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  return (
    <form onSubmit={save}>
      <button type="button" onClick={onDone} className="mb-4 flex items-center gap-2 text-sm text-earth-light hover:text-terracotta">
        <LuArrowLeft /> Back to tours
      </button>
      <AdminTitle title={isNew ? 'New tour' : `Edit: ${initial.title}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card space-y-4 p-6">
          <h2 className="font-display text-xl font-semibold">Basics</h2>
          <div>
            <label className="label" htmlFor="t-title">Title</label>
            <input id="t-title" className="input" value={t.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t-tag">Short tagline</label>
            <input id="t-tag" className="input" value={t.tagline} onChange={(e) => set('tagline', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="t-desc">Description</label>
            <textarea id="t-desc" rows={6} className="input" value={t.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="t-price">Price per person (USD)</label>
              <input id="t-price" type="number" min={0} className="input" value={t.price} onChange={(e) => set('price', Number(e.target.value))} />
            </div>
            <div>
              <label className="label" htmlFor="t-dur">Length</label>
              <input id="t-dur" className="input" value={t.duration} onChange={(e) => set('duration', e.target.value)} placeholder="3 days / 2 nights" />
            </div>
            <div>
              <label className="label" htmlFor="t-loc">Location</label>
              <input id="t-loc" className="input" value={t.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="t-grp">Group size</label>
              <input id="t-grp" className="input" value={t.groupSize} onChange={(e) => set('groupSize', e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[#b85c38]" checked={t.featured} onChange={(e) => set('featured', e.target.checked)} />
            Feature this tour on the home page
          </label>
          <ImageInput value={t.image} onChange={(v) => set('image', v)} label="Tour photo" />
        </div>

        <div className="space-y-6">
          <div className="card space-y-3 p-6">
            <h2 className="font-display text-xl font-semibold">Highlights</h2>
            <p className="text-xs text-earth/60">One highlight per line.</p>
            <textarea rows={6} className="input" value={highlights} onChange={(e) => setHighlights(e.target.value)} aria-label="Highlights" />
          </div>

          <div className="card space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">Day-by-day plan</h2>
            {t.itinerary.map((d, i) => (
              <div key={i} className="relative rounded-2xl bg-cream p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-terracotta uppercase">Day {i + 1}</span>
                  {t.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => set('itinerary', t.itinerary.filter((_, j) => j !== i))}
                      className="rounded-full p-1 text-earth/50 hover:text-terracotta"
                      aria-label={`Remove day ${i + 1}`}
                    >
                      <LuX />
                    </button>
                  )}
                </div>
                <input
                  className="input mb-2"
                  placeholder="Title, e.g. Kigali to Musanze"
                  value={d.title}
                  onChange={(e) => set('itinerary', t.itinerary.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                />
                <textarea
                  rows={3}
                  className="input"
                  placeholder="What happens on this day"
                  value={d.description}
                  onChange={(e) => set('itinerary', t.itinerary.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
                />
              </div>
            ))}
            <button type="button" className="btn-ghost" onClick={() => set('itinerary', [...t.itinerary, { title: '', description: '' }])}>
              <LuPlus /> Add a day
            </button>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 mt-6 flex gap-3 border-t border-earth/10 bg-cream/95 py-4 backdrop-blur">
        <button className="btn-primary">{isNew ? 'Add tour' : 'Save changes'}</button>
        <button type="button" className="btn-ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  )
}
