import { useState, type FormEvent } from 'react'
import { LuPlus, LuTrash2, LuBan, LuRotateCcw, LuCalendarDays } from 'react-icons/lu'
import { useDB, update, bookedGuests } from '../../lib/store'
import { Calendar } from '../../components/Calendar'
import { formatDate, formatTime, todayISO, toISODate, addDays, fromISODate, WEEKDAYS } from '../../lib/dates'
import { uid } from '../../lib/id'
import { toast } from '../../lib/toast'
import { AdminTitle } from './Admin'

export default function CalendarAdmin() {
  const db = useDB((d) => d)
  const [date, setDate] = useState<string | null>(todayISO())
  const today = todayISO()

  const daySlots = date ? db.slots.filter((s) => s.date === date).sort((a, b) => a.time.localeCompare(b.time)) : []
  const blocked = date ? db.blockedDates.includes(date) : false

  const toggleBlock = () => {
    if (!date) return
    update((d) => {
      d.blockedDates = blocked ? d.blockedDates.filter((x) => x !== date) : [...d.blockedDates, date]
    })
    toast(blocked ? 'Day reopened.' : 'Day blocked — guests can no longer book it.')
  }

  return (
    <>
      <AdminTitle title="Calendar" subtitle="Open dates, set time slots and spots, and block days you’re not available." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <Calendar
              selected={date}
              onSelect={setDate}
              getDay={(d) => {
                if (db.blockedDates.includes(d)) return { tone: 'blocked', disabled: false, badge: 'off' }
                const slots = db.slots.filter((s) => s.date === d)
                if (!slots.length) return { tone: 'muted', disabled: false }
                const booked = slots.reduce((n, s) => n + bookedGuests(db.bookings, s.id), 0)
                return { tone: booked ? 'busy' : 'available', disabled: false, badge: booked ? `${booked} bkd` : `${slots.length} slot${slots.length > 1 ? 's' : ''}` }
              }}
            />
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-earth-light">
              <Legend cls="bg-olive/30" label="Open" />
              <Legend cls="bg-sand-light" label="Has bookings" />
              <Legend cls="bg-terracotta/20" label="Blocked" />
            </div>
          </div>
          <BulkOpen tours={db.tours} />
        </div>

        <div className="card h-fit p-6">
          {!date ? (
            <p className="text-sm text-earth-light">Select a day to manage it.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                  <p className="text-sm text-earth-light">{blocked ? 'Blocked — hidden from guests.' : daySlots.length ? `${daySlots.length} time slot(s)` : 'No time slots yet.'}</p>
                </div>
                <button onClick={toggleBlock} className={blocked ? 'btn-ghost !py-2' : 'btn-ghost !py-2 hover:!border-terracotta hover:!text-terracotta'}>
                  {blocked ? (
                    <>
                      <LuRotateCcw /> Unblock day
                    </>
                  ) : (
                    <>
                      <LuBan /> Block this day
                    </>
                  )}
                </button>
              </div>
              {date <= today && <p className="mt-3 rounded-xl bg-sand-light/50 p-3 text-xs">This day is today or in the past, so guests can’t book it.</p>}

              <div className="mt-6 space-y-3">
                {daySlots.map((s) => {
                  const booked = bookedGuests(db.bookings, s.id)
                  return (
                    <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream p-4">
                      <span className="w-20 font-semibold">{formatTime(s.time)}</span>
                      <label className="flex items-center gap-2 text-sm">
                        Spots
                        <input
                          type="number"
                          min={Math.max(1, booked)}
                          className="input !w-20 !py-2"
                          value={s.capacity}
                          onChange={(e) => {
                            const v = Math.max(Math.max(1, booked), Number(e.target.value) || 1)
                            update((d) => {
                              const x = d.slots.find((y) => y.id === s.id)
                              if (x) x.capacity = v
                            })
                          }}
                        />
                      </label>
                      <select
                        className="input !w-auto !py-2"
                        value={s.tourId ?? ''}
                        onChange={(e) =>
                          update((d) => {
                            const x = d.slots.find((y) => y.id === s.id)
                            if (x) x.tourId = e.target.value || null
                          })
                        }
                        aria-label="Tour for this slot"
                      >
                        <option value="">Any tour</option>
                        {db.tours.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-earth-light">
                        {booked} booked · {Math.max(0, s.capacity - booked)} left
                      </span>
                      <button
                        className="ml-auto rounded-full p-2 text-earth/50 hover:bg-white hover:text-terracotta"
                        aria-label="Delete slot"
                        onClick={() => {
                          if (booked && !confirm('This slot has bookings. Delete it anyway? The bookings will stay in your list.')) return
                          update((d) => {
                            d.slots = d.slots.filter((x) => x.id !== s.id)
                          })
                        }}
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  )
                })}
              </div>
              <AddSlot date={date} tours={db.tours} />
            </>
          )}
        </div>
      </div>
    </>
  )
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded ${cls}`} /> {label}
    </span>
  )
}

function AddSlot({ date, tours }: { date: string; tours: { id: string; title: string }[] }) {
  const [time, setTime] = useState('08:00')
  const [cap, setCap] = useState(6)
  const [tourId, setTourId] = useState('')
  const add = (e: FormEvent) => {
    e.preventDefault()
    update((d) => {
      d.slots.push({ id: uid(), date, time, capacity: Math.max(1, cap), tourId: tourId || null })
    })
    toast(`Slot added at ${formatTime(time)}.`)
  }
  return (
    <form onSubmit={add} className="mt-6 flex flex-wrap items-end gap-3 border-t border-earth/10 pt-6">
      <div>
        <label className="label" htmlFor="as-time">Time</label>
        <input id="as-time" type="time" required className="input !py-2" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="as-cap">Spots</label>
        <input id="as-cap" type="number" min={1} className="input !w-24 !py-2" value={cap} onChange={(e) => setCap(Number(e.target.value))} />
      </div>
      <div className="min-w-40 flex-1">
        <label className="label" htmlFor="as-tour">For tour</label>
        <select id="as-tour" className="input !py-2" value={tourId} onChange={(e) => setTourId(e.target.value)}>
          <option value="">Any tour</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary !py-2.5">
        <LuPlus /> Add slot
      </button>
    </form>
  )
}

function BulkOpen({ tours }: { tours: { id: string; title: string }[] }) {
  const [from, setFrom] = useState(toISODate(addDays(new Date(), 1)))
  const [to, setTo] = useState(toISODate(addDays(new Date(), 30)))
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5]) // Mon–Sat (Monday = 0)
  const [times, setTimes] = useState('07:00, 13:00')
  const [cap, setCap] = useState(6)
  const [tourId, setTourId] = useState('')

  const run = (e: FormEvent) => {
    e.preventDefault()
    const list = times
      .split(',')
      .map((t) => t.trim())
      .filter((t) => /^\d{1,2}:\d{2}$/.test(t))
      .map((t) => t.padStart(5, '0'))
    if (!list.length) return toast('Add at least one time like 07:00.', 'error')
    if (to < from) return toast('The end date must be after the start date.', 'error')
    let added = 0
    update((d) => {
      for (let cur = fromISODate(from); toISODate(cur) <= to; cur = addDays(cur, 1)) {
        const iso = toISODate(cur)
        if (!days.includes((cur.getDay() + 6) % 7)) continue
        for (const time of list) {
          const exists = d.slots.some((s) => s.date === iso && s.time === time && (s.tourId ?? '') === tourId)
          if (!exists) {
            d.slots.push({ id: uid(), date: iso, time, capacity: Math.max(1, cap), tourId: tourId || null })
            added++
          }
        }
      }
    })
    toast(added ? `Opened ${added} new slot${added > 1 ? 's' : ''}.` : 'Those slots already exist.')
  }

  return (
    <form onSubmit={run} className="card space-y-4 p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        <LuCalendarDays className="text-terracotta" /> Open many dates at once
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="bo-from">From</label>
          <input id="bo-from" type="date" className="input !py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="bo-to">To</label>
          <input id="bo-to" type="date" className="input !py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div>
        <span className="label">On these days</span>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((w, i) => (
            <button
              type="button"
              key={w}
              onClick={() => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${days.includes(i) ? 'bg-olive text-cream' : 'bg-cream-dark text-earth/60'}`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="bo-times">Start times</label>
          <input id="bo-times" className="input !py-2" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="07:00, 13:00" />
        </div>
        <div>
          <label className="label" htmlFor="bo-cap">Spots per slot</label>
          <input id="bo-cap" type="number" min={1} className="input !py-2" value={cap} onChange={(e) => setCap(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bo-tour">For tour</label>
        <select id="bo-tour" className="input !py-2" value={tourId} onChange={(e) => setTourId(e.target.value)}>
          <option value="">Any tour</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary w-full">Open these dates</button>
    </form>
  )
}
