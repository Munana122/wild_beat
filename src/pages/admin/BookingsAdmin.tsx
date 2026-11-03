import { useState } from 'react'
import { LuTrash2, LuBed, LuMail, LuPhone, LuCheck, LuX, LuDownload } from 'react-icons/lu'
import { useDB, update } from '../../lib/store'
import { formatDate, formatTime, formatDateTime, todayISO } from '../../lib/dates'
import { toast } from '../../lib/toast'
import type { BookingStatus } from '../../lib/types'
import { StatusPill } from '../Book'
import { AdminTitle } from './Admin'
import { downloadCSV } from './csv'

type Filter = 'upcoming' | 'pending' | 'past' | 'all'

export default function BookingsAdmin() {
  const db = useDB((d) => d)
  const [filter, setFilter] = useState<Filter>('upcoming')
  const today = todayISO()
  const tourName = (id: string) => db.tours.find((t) => t.id === id)?.title ?? 'Deleted tour'

  const list = db.bookings
    .filter((b) =>
      filter === 'all' ? true : filter === 'pending' ? b.status === 'pending' : filter === 'past' ? b.date < today : b.date >= today && b.status !== 'cancelled',
    )
    .sort((a, b) => (filter === 'past' ? -1 : 1) * (a.date + a.time).localeCompare(b.date + b.time))

  const setStatus = (id: string, status: BookingStatus) =>
    update((d) => {
      const b = d.bookings.find((x) => x.id === id)
      if (b) b.status = status
    })

  return (
    <>
      <AdminTitle
        title="Bookings"
        subtitle="Booking requests from guests. Confirm them after you’ve spoken with the guest."
        action={
          <button
            className="btn-ghost"
            onClick={() =>
              downloadCSV(
                'wildbeat-bookings.csv',
                db.bookings.map((b) => ({
                  Tour: tourName(b.tourId),
                  Date: b.date,
                  Time: b.time,
                  Guests: b.guests,
                  Name: b.name,
                  Email: b.email,
                  Phone: b.phone,
                  Status: b.status,
                  'Accommodation help': b.accommodationHelp ? 'Yes' : 'No',
                  'Accommodation notes': b.accommodationNotes,
                  Notes: b.notes,
                  Requested: b.createdAt,
                })),
              )
            }
          >
            <LuDownload /> Export CSV
          </button>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {(['upcoming', 'pending', 'past', 'all'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${filter === f ? 'bg-earth text-cream' : 'bg-white text-earth-light shadow-soft'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No bookings here.</p>
      ) : (
        <div className="grid gap-4">
          {list.map((b) => (
            <article key={b.id} className="card p-5 md:p-6">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold">{tourName(b.tourId)}</p>
                  <p className="text-sm text-earth-light">
                    {formatDate(b.date)} · {formatTime(b.time)} · {b.guests} guest{b.guests > 1 ? 's' : ''}
                  </p>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <p className="font-semibold">{b.name}</p>
                <a href={`mailto:${b.email}`} className="flex items-center gap-2 break-all text-earth-light hover:text-terracotta">
                  <LuMail className="shrink-0" /> {b.email}
                </a>
                {b.phone && (
                  <a href={`tel:${b.phone}`} className="flex items-center gap-2 text-earth-light hover:text-terracotta">
                    <LuPhone /> {b.phone}
                  </a>
                )}
              </div>
              {b.accommodationHelp && (
                <div className="mt-3 flex gap-2 rounded-xl bg-olive/10 p-3 text-sm">
                  <LuBed className="mt-0.5 shrink-0 text-olive-dark" />
                  <p>
                    <strong>Wants accommodation help.</strong> {b.accommodationNotes}
                  </p>
                </div>
              )}
              {b.notes && <p className="mt-3 rounded-xl bg-cream p-3 text-sm whitespace-pre-line">{b.notes}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-earth/10 pt-4">
                <span className="mr-auto text-xs text-earth/50">Requested {formatDateTime(b.createdAt)}</span>
                {b.status !== 'confirmed' && (
                  <button className="btn-ghost !px-4 !py-2 hover:!border-olive hover:!text-olive" onClick={() => setStatus(b.id, 'confirmed')}>
                    <LuCheck /> Confirm
                  </button>
                )}
                {b.status !== 'cancelled' && (
                  <button className="btn-ghost !px-4 !py-2" onClick={() => setStatus(b.id, 'cancelled')}>
                    <LuX /> Cancel
                  </button>
                )}
                <button
                  className="btn-ghost !px-3 !py-2 hover:!border-terracotta hover:!text-terracotta"
                  aria-label="Delete booking"
                  onClick={() => {
                    if (!confirm('Remove this booking permanently?')) return
                    update((d) => {
                      d.bookings = d.bookings.filter((x) => x.id !== b.id)
                    })
                    toast('Booking removed.')
                  }}
                >
                  <LuTrash2 />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
