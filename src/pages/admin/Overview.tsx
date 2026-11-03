import { LuTicket, LuMessageSquare, LuImage, LuMail, LuInbox, LuCalendarDays } from 'react-icons/lu'
import { useDB } from '../../lib/store'
import { Link } from '../../lib/router'
import { formatDate, formatTime, todayISO } from '../../lib/dates'
import { AdminTitle } from './Admin'
import { StatusPill } from '../Book'

export default function Overview() {
  const db = useDB((d) => d)
  const today = todayISO()
  const upcoming = db.bookings
    .filter((b) => b.date >= today && b.status !== 'cancelled')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 6)
  const openDays = new Set(db.slots.filter((s) => s.date > today && !db.blockedDates.includes(s.date)).map((s) => s.date)).size

  const stats = [
    { label: 'Pending bookings', value: db.bookings.filter((b) => b.status === 'pending').length, icon: LuTicket, to: '/admin/bookings' },
    { label: 'Open days ahead', value: openDays, icon: LuCalendarDays, to: '/admin/calendar' },
    { label: 'Unanswered requests', value: db.supportRequests.filter((r) => !r.reply).length, icon: LuInbox, to: '/admin/support' },
    { label: 'Reviews', value: db.reviews.length, icon: LuMessageSquare, to: '/admin/reviews' },
    { label: 'Gallery photos', value: db.photos.length, icon: LuImage, to: '/admin/gallery' },
    { label: 'Subscribers', value: db.subscribers.length, icon: LuMail, to: '/admin/subscribers' },
  ]

  return (
    <>
      <AdminTitle title="Overview" subtitle="Everything happening on Wildbeat at a glance." />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
            <s.icon className="text-2xl text-terracotta" />
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
            <p className="text-sm text-earth-light">{s.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-12 mb-4 font-display text-2xl font-semibold">Upcoming tours</h2>
      {upcoming.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No upcoming bookings yet.</p>
      ) : (
        <div className="card divide-y divide-earth/10">
          {upcoming.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 p-4 text-sm">
              <p className="w-36 font-semibold">
                {formatDate(b.date)} <span className="font-normal text-earth-light">{formatTime(b.time)}</span>
              </p>
              <p className="min-w-0 flex-1">{db.tours.find((t) => t.id === b.tourId)?.title ?? 'Deleted tour'}</p>
              <p className="text-earth-light">
                {b.name} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
              <StatusPill status={b.status} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
