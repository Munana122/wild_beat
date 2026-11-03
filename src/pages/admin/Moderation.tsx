import { useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { useDB, update } from '../../lib/store'
import { formatDateTime } from '../../lib/dates'
import { toast } from '../../lib/toast'
import { Stars } from '../../components/ui'
import { PHOTO_CATEGORIES, type PhotoCategory } from '../../lib/types'
import { AdminTitle } from './Admin'

export function ReviewsAdmin() {
  const reviews = useDB((d) => d.reviews)
  const tours = useDB((d) => d.tours)
  const sorted = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <>
      <AdminTitle title="Reviews" subtitle={`${reviews.length} review${reviews.length === 1 ? '' : 's'} from guests.`} />
      {sorted.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No reviews yet.</p>
      ) : (
        <div className="grid gap-4">
          {sorted.map((r) => (
            <article key={r.id} className="card flex gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold">{r.name}</p>
                  <Stars value={r.rating} size="text-sm" />
                </div>
                <p className="text-xs text-earth/50">
                  {tours.find((t) => t.id === r.tourId)?.title ?? 'General'} · {formatDateTime(r.createdAt)}
                </p>
                <p className="mt-2 text-sm whitespace-pre-line text-earth-light">{r.text}</p>
              </div>
              <button
                className="h-fit rounded-full p-2 text-earth/50 hover:bg-cream hover:text-terracotta"
                aria-label="Delete review"
                onClick={() => {
                  if (!confirm('Delete this review?')) return
                  update((d) => {
                    d.reviews = d.reviews.filter((x) => x.id !== r.id)
                  })
                  toast('Review deleted.')
                }}
              >
                <LuTrash2 />
              </button>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

export function GalleryAdmin() {
  const photos = useDB((d) => d.photos)
  const [cat, setCat] = useState<PhotoCategory | 'All'>('All')
  const shown = [...photos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((p) => cat === 'All' || p.category === cat)
  return (
    <>
      <AdminTitle title="Gallery" subtitle="Guest photos appear instantly. Remove anything that shouldn’t be there." />
      <div className="mb-6 flex flex-wrap gap-2">
        {(['All', ...PHOTO_CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-sm font-medium ${cat === c ? 'bg-earth text-cream' : 'bg-white text-earth-light shadow-soft'}`}>
            {c}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((p) => (
            <figure key={p.id} className="card overflow-hidden">
              <img src={p.src} alt={p.caption} className="aspect-square w-full object-cover" />
              <figcaption className="flex items-start gap-2 p-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.category}</p>
                  <p className="truncate text-earth-light">by {p.name}</p>
                  {p.caption && <p className="truncate text-earth/50">{p.caption}</p>}
                </div>
                <button
                  className="rounded-full p-1.5 text-earth/50 hover:bg-cream hover:text-terracotta"
                  aria-label="Delete photo"
                  onClick={() => {
                    if (!confirm('Delete this photo?')) return
                    update((d) => {
                      d.photos = d.photos.filter((x) => x.id !== p.id)
                    })
                    toast('Photo deleted.')
                  }}
                >
                  <LuTrash2 />
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}
