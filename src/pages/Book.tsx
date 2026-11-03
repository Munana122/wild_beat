import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuCheck, LuBed, LuCalendarDays, LuClock, LuUsers, LuArrowLeft, LuSend } from 'react-icons/lu'
import { useDB, update, availableDates, slotsFor, spotsLeft, getDB } from '../lib/store'
import { useLocation, Link } from '../lib/router'
import { useCurrentUser } from '../lib/auth'
import { formatDate, formatTime, todayISO, fromISODate } from '../lib/dates'
import { uid } from '../lib/id'
import { toast } from '../lib/toast'
import { Calendar } from '../components/Calendar'
import { PageHeader, money } from '../components/ui'
import type { Booking } from '../lib/types'

export default function Book() {
  const { search } = useLocation()
  const state = useDB((db) => db)
  const user = useCurrentUser()
  const [tourId, setTourId] = useState<string | null>(search.get('tour'))
  const [date, setDate] = useState<string | null>(null)
  const [slotId, setSlotId] = useState<string | null>(null)
  const [done, setDone] = useState<Booking | null>(null)

  const tour = state.tours.find((t) => t.id === tourId) ?? null
  const dates = useMemo(() => (tour ? availableDates(state, tour.id) : new Set<string>()), [state, tour])
  const slots = tour && date ? slotsFor(state, tour.id, date) : []
  const slot = slots.find((s) => s.id === slotId) ?? null
  const left = slot ? spotsLeft(state, slot) : 0
  const myBookings = user ? state.bookings.filter((b) => b.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []

  const step = !tour ? 1 : !slot ? 2 : 3

  const firstAvailable = useMemo(() => {
    const sorted = [...dates].sort()
    return sorted[0] ? fromISODate(sorted[0]) : undefined
  }, [dates])

  if (done) {
    return <Confirmation booking={done} onAgain={() => { setDone(null); setDate(null); setSlotId(null) }} />
  }

  return (
    <>
      <PageHeader
        eyebrow="Book your adventure"
        title="Choose a tour and a date"
        subtitle="Only the days Ilyce is free are shown. Send a request — no payment needed now — and she will confirm with you personally."
        image={tour?.image ?? state.settings.heroImage}
      />

      <section className="container-x py-12 md:py-16">
        <ol className="mb-10 flex flex-wrap items-center gap-2 text-sm">
          {['Tour', 'Date & time', 'Your details'].map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  step > i + 1 ? 'bg-olive text-cream' : step === i + 1 ? 'bg-terracotta text-cream' : 'bg-cream-dark text-earth/50'
                }`}
              >
                {step > i + 1 ? <LuCheck /> : i + 1}
              </span>
              <span className={step >= i + 1 ? 'font-semibold' : 'text-earth/50'}>{label}</span>
              {i < 2 && <span className="mx-2 hidden h-px w-10 bg-earth/20 sm:block" />}
            </li>
          ))}
        </ol>

        {/* STEP 1 — tour */}
        <div>
          <h2 className="font-display text-2xl font-semibold">1. Pick your tour</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {state.tours.map((t) => {
              const active = t.id === tourId
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTourId(t.id)
                    setDate(null)
                    setSlotId(null)
                  }}
                  className={`group overflow-hidden rounded-3xl bg-white text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${
                    active ? 'ring-4 ring-terracotta' : ''
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={t.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {active && (
                      <span className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-terracotta text-cream">
                        <LuCheck />
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-display text-sm leading-snug font-semibold sm:text-base">{t.title}</p>
                    <p className="mt-1 text-xs text-earth-light">
                      {t.duration} · from {money(t.price)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* STEP 2 — date & slot */}
        <AnimatePresence>
          {tour && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
              <div className="card p-6">
                <h2 className="mb-5 font-display text-2xl font-semibold">2. Choose a date</h2>
                {dates.size === 0 ? (
                  <p className="rounded-2xl bg-sand-light/40 p-4 text-sm">
                    Ilyce has no open dates for this tour right now. Please contact her on{' '}
                    <a className="font-semibold text-terracotta" href={`tel:${state.settings.phone.replace(/[^+\d]/g, '')}`}>
                      {state.settings.phone}
                    </a>{' '}
                    and she'll find a day that works.
                  </p>
                ) : (
                  <>
                    <Calendar
                      key={tour.id}
                      selected={date}
                      initialMonth={firstAvailable}
                      onSelect={(d) => {
                        setDate(d)
                        setSlotId(null)
                      }}
                      getDay={(d) => {
                        const ok = dates.has(d)
                        return { tone: ok ? 'available' : 'muted', disabled: !ok || d <= todayISO() }
                      }}
                    />
                    <div className="mt-4 flex items-center gap-4 text-xs text-earth-light">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-olive/30" /> Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded bg-terracotta" /> Selected
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div>
                {date ? (
                  <motion.div key={date} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
                    <h2 className="font-display text-2xl font-semibold">Pick a start time</h2>
                    <p className="mt-1 text-sm text-earth-light">{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {slots.map((s) => {
                        const n = spotsLeft(state, s)
                        const full = n === 0
                        const active = s.id === slotId
                        return (
                          <button
                            key={s.id}
                            disabled={full}
                            onClick={() => setSlotId(s.id)}
                            className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left transition ${
                              active ? 'border-terracotta bg-terracotta/5' : 'border-earth/10 bg-white hover:border-sand'
                            } disabled:opacity-50`}
                          >
                            <span className="flex items-center gap-3">
                              <LuClock className="text-xl text-olive" />
                              <span className="font-semibold">{formatTime(s.time)}</span>
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                full ? 'bg-earth/10 text-earth/60' : n <= 2 ? 'bg-terracotta/15 text-terracotta' : 'bg-olive/15 text-olive-dark'
                              }`}
                            >
                              {full ? 'Full' : `${n} spot${n > 1 ? 's' : ''} left`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid h-full min-h-48 place-items-center rounded-3xl border-2 border-dashed border-earth/15 p-8 text-center text-earth-light">
                    <div>
                      <LuCalendarDays className="mx-auto text-4xl text-sand-dark" />
                      <p className="mt-3">Select a green date to see start times and spots left.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 3 — details */}
        <AnimatePresence>
          {tour && slot && date && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10">
              <DetailsForm
                key={slot.id}
                maxGuests={left}
                summary={`${tour.title} · ${formatDate(date)} · ${formatTime(slot.time)}`}
                onSubmit={(details) => {
                  const fresh = getDB()
                  const s = fresh.slots.find((x) => x.id === slot.id)
                  if (!s || spotsLeft(fresh, s) < details.guests) {
                    toast('Sorry, those spots were just taken. Please choose another time.', 'error')
                    setSlotId(null)
                    return
                  }
                  const booking: Booking = {
                    id: uid(),
                    tourId: tour.id,
                    slotId: slot.id,
                    date,
                    time: slot.time,
                    ...details,
                    userId: user?.id ?? null,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                  }
                  update((db) => {
                    db.bookings.push(booking)
                  })
                  setDone(booking)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {myBookings.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-semibold">Your booking requests</h2>
            <div className="mt-5 grid gap-3">
              {myBookings.map((b) => (
                <div key={b.id} className="card flex flex-wrap items-center gap-x-6 gap-y-2 p-5 text-sm">
                  <p className="font-semibold">{state.tours.find((t) => t.id === b.tourId)?.title ?? 'Tour'}</p>
                  <p className="text-earth-light">
                    {formatDate(b.date)} · {formatTime(b.time)} · {b.guests} guest{b.guests > 1 ? 's' : ''}
                  </p>
                  <StatusPill status={b.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export function StatusPill({ status }: { status: Booking['status'] }) {
  const cls = status === 'confirmed' ? 'bg-olive/15 text-olive-dark' : status === 'cancelled' ? 'bg-earth/10 text-earth/60' : 'bg-sand-light text-earth'
  return <span className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold capitalize ${cls}`}>{status}</span>
}

type Details = Pick<Booking, 'name' | 'email' | 'phone' | 'guests' | 'accommodationHelp' | 'accommodationNotes' | 'notes'>

function DetailsForm({ maxGuests, summary, onSubmit }: { maxGuests: number; summary: string; onSubmit: (d: Details) => void }) {
  const user = useCurrentUser()
  const [d, setD] = useState<Details>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    guests: 1,
    accommodationHelp: false,
    accommodationNotes: '',
    notes: '',
  })
  const set = <K extends keyof Details>(k: K, v: Details[K]) => setD((x) => ({ ...x, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) return toast('Please add your name and a valid email.', 'error')
    if (d.guests < 1 || d.guests > maxGuests) return toast(`Please choose between 1 and ${maxGuests} guests.`, 'error')
    onSubmit({ ...d, name: d.name.trim(), email: d.email.trim() })
  }

  return (
    <form onSubmit={submit} className="card grid gap-8 p-6 md:p-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">3. Your details</h2>
          <p className="mt-1 text-sm text-earth-light">{summary}</p>
        </div>
        <div>
          <label className="label" htmlFor="b-name">Full name</label>
          <input id="b-name" className="input" required value={d.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="b-email">Email</label>
            <input id="b-email" type="email" className="input" required value={d.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="b-phone">Phone / WhatsApp</label>
            <input id="b-phone" type="tel" className="input" value={d.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 …" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="b-guests">
            Number of guests <span className="text-earth/50">({maxGuests} spot{maxGuests > 1 ? 's' : ''} left)</span>
          </label>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-ghost !h-11 !w-11 !p-0 text-lg" onClick={() => set('guests', Math.max(1, d.guests - 1))} aria-label="Fewer guests">
              −
            </button>
            <span id="b-guests" className="flex w-16 items-center justify-center gap-1.5 text-lg font-semibold">
              <LuUsers className="text-olive" /> {d.guests}
            </span>
            <button type="button" className="btn-ghost !h-11 !w-11 !p-0 text-lg" onClick={() => set('guests', Math.min(maxGuests, d.guests + 1))} aria-label="More guests">
              +
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className={`flex cursor-pointer gap-4 rounded-2xl border-2 p-5 transition ${d.accommodationHelp ? 'border-olive bg-olive/5' : 'border-earth/10'}`}>
          <input type="checkbox" className="mt-1 h-5 w-5 accent-[#6b7344]" checked={d.accommodationHelp} onChange={(e) => set('accommodationHelp', e.target.checked)} />
          <span>
            <span className="flex items-center gap-2 font-semibold">
              <LuBed className="text-olive" /> Help me book accommodation
            </span>
            <span className="mt-1 block text-sm text-earth-light">Ilyce will suggest and reserve places to stay that match your budget and style.</span>
          </span>
        </label>
        {d.accommodationHelp && (
          <div>
            <label className="label" htmlFor="b-acc">Accommodation wishes</label>
            <textarea
              id="b-acc"
              rows={3}
              className="input"
              value={d.accommodationNotes}
              onChange={(e) => set('accommodationNotes', e.target.value)}
              placeholder="e.g. mid-range lodge, 2 rooms, one with a cot for a toddler, around $150/night"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="b-notes">Anything else Ilyce should know?</label>
          <textarea
            id="b-notes"
            rows={3}
            className="input"
            value={d.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Ages of children, mobility needs, dietary needs, pick-up hotel…"
          />
        </div>
        <button className="btn-primary w-full !py-3.5 text-base">
          <LuSend /> Send booking request
        </button>
      </div>
    </form>
  )
}

function Confirmation({ booking, onAgain }: { booking: Booking; onAgain: () => void }) {
  const state = useDB((db) => db)
  const tour = state.tours.find((t) => t.id === booking.tourId)
  const phone = state.settings.phone.replace(/[^\d]/g, '')
  const msg = encodeURIComponent(
    `Hello Ilyce! I just sent a booking request on your website:\n${tour?.title}\n${formatDate(booking.date)} at ${formatTime(booking.time)}\n${booking.guests} guest(s)\nName: ${booking.name}${
      booking.accommodationHelp ? '\nI would also like help booking accommodation.' : ''
    }`,
  )
  return (
    <section className="container-x flex min-h-[80vh] items-center justify-center pt-28 pb-16">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-xl p-8 text-center md:p-10">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-olive text-4xl text-cream"
        >
          <LuCheck />
        </motion.span>
        <h1 className="mt-6 font-display text-3xl font-semibold">Request sent — murakoze!</h1>
        <p className="mt-3 text-earth-light">Ilyce will get back to you at <strong>{booking.email}</strong> to confirm your tour{booking.accommodationHelp ? ' and your accommodation options' : ''}.</p>
        <dl className="mt-7 grid gap-3 rounded-2xl bg-cream p-5 text-left text-sm">
          <Row icon={<LuCalendarDays />} label="Tour" value={tour?.title ?? ''} />
          <Row icon={<LuClock />} label="When" value={`${formatDate(booking.date)} · ${formatTime(booking.time)}`} />
          <Row icon={<LuUsers />} label="Guests" value={String(booking.guests)} />
          {booking.accommodationHelp && <Row icon={<LuBed />} label="Stay" value="Accommodation help requested" />}
        </dl>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noreferrer" className="btn-primary">
            Also message on WhatsApp
          </a>
          <button onClick={onAgain} className="btn-ghost">
            <LuArrowLeft /> Book another
          </button>
        </div>
        <Link to="/" className="mt-6 inline-block text-sm text-earth-light hover:text-terracotta">
          Back to home
        </Link>
      </motion.div>
    </section>
  )
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-olive">{icon}</span>
      <dt className="w-16 text-earth/60">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
