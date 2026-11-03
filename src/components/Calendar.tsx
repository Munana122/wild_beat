import { useState } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { monthGrid, toISODate, WEEKDAYS, todayISO } from '../lib/dates'

export type DayTone = 'available' | 'blocked' | 'muted' | 'busy'

export interface DayInfo {
  tone: DayTone
  disabled: boolean
  badge?: string
}

const toneClass: Record<DayTone, string> = {
  available: 'bg-olive/25 text-olive-dark font-semibold hover:bg-olive hover:text-cream',
  busy: 'bg-sand-light/70 text-earth font-semibold hover:bg-sand',
  blocked: 'bg-terracotta/10 text-terracotta line-through hover:bg-terracotta/20',
  muted: 'text-earth/30',
}

export function Calendar({
  selected,
  onSelect,
  getDay,
  initialMonth,
}: {
  selected: string | null
  onSelect: (date: string) => void
  getDay: (date: string) => DayInfo
  initialMonth?: Date
}) {
  const start = initialMonth ?? new Date()
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const days = monthGrid(cursor.y, cursor.m)
  const today = todayISO()
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const shift = (n: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} className="rounded-full p-2 text-lg hover:bg-cream-dark" aria-label="Previous month">
          <LuChevronLeft />
        </button>
        <p className="font-display text-lg font-semibold">{label}</p>
        <button type="button" onClick={() => shift(1)} className="rounded-full p-2 text-lg hover:bg-cream-dark" aria-label="Next month">
          <LuChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wide text-earth/50 uppercase">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISODate(d)
          const inMonth = d.getMonth() === cursor.m
          const info = getDay(iso)
          const isSel = selected === iso
          return (
            <button
              type="button"
              key={iso}
              disabled={info.disabled}
              onClick={() => onSelect(iso)}
              aria-pressed={isSel}
              aria-label={`${d.toDateString()}${info.disabled ? ' (unavailable)' : ''}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition ${
                isSel ? '!bg-terracotta font-semibold !text-cream shadow-soft' : toneClass[info.tone]
              } ${!inMonth ? 'opacity-40' : ''} ${iso === today && !isSel ? 'ring-2 ring-sand ring-inset' : ''} disabled:cursor-not-allowed`}
            >
              {d.getDate()}
              {info.badge && <span className={`text-[9px] leading-none ${isSel ? 'text-cream/80' : 'opacity-70'}`}>{info.badge}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
