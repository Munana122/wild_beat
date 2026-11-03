/**
 * Wildbeat data store.
 *
 * Everything is saved in the browser's localStorage so the site works with
 * no server. All reads and writes go through this file, so moving to a real
 * backend (Supabase, Firebase, your own API) only means replacing it.
 */
import { useSyncExternalStore } from 'react'
import type { Booking, DB, Slot } from './types'
import { createSeedDB, DEFAULT_SETTINGS } from './seed'
import { todayISO } from './dates'

const KEY = 'wildbeat:db'
const SESSION_KEY = 'wildbeat:session'

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      // fill in any settings added in later versions
      parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings }
      return parsed
    }
  } catch {
    /* fall through to seed */
  }
  const seed = createSeedDB()
  persist(seed)
  return seed
}

function persist(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      throw new Error('Storage is full. Please remove some photos or use a smaller image.')
    }
    throw e
  }
}

let db: DB = load()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function getDB() {
  return db
}

/** Apply a change. Throws if the browser storage is full (state is rolled back). */
export function update(mutator: (draft: DB) => void) {
  const next: DB = structuredClone(db)
  mutator(next)
  persist(next)
  db = next
  emit()
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

// keep tabs in sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      db = load()
      emit()
    }
  })
}

/** Subscribe to the store. The selector runs on each render, so it may return new arrays. */
export function useDB<T>(selector: (db: DB) => T): T {
  const state = useSyncExternalStore(subscribe, getDB)
  return selector(state)
}

export function resetDB() {
  db = createSeedDB()
  persist(db)
  emit()
}

/* ---------- session ---------- */

export function getSessionUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function setSessionUserId(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

/* ---------- availability helpers ---------- */

export function bookedGuests(bookings: Booking[], slotId: string) {
  return bookings
    .filter((b) => b.slotId === slotId && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.guests, 0)
}

export function spotsLeft(state: DB, slot: Slot) {
  return Math.max(0, slot.capacity - bookedGuests(state.bookings, slot.id))
}

export function slotsFor(state: DB, tourId: string, date: string) {
  if (state.blockedDates.includes(date)) return []
  return state.slots
    .filter((s) => s.date === date && (s.tourId === null || s.tourId === tourId))
    .sort((a, b) => a.time.localeCompare(b.time))
}

/** Dates (from today) that have at least one slot with spots left for this tour. */
export function availableDates(state: DB, tourId: string) {
  const today = todayISO()
  const set = new Set<string>()
  for (const s of state.slots) {
    if (s.date <= today) continue
    if (s.tourId !== null && s.tourId !== tourId) continue
    if (state.blockedDates.includes(s.date)) continue
    if (spotsLeft(state, s) > 0) set.add(s.date)
  }
  return set
}
