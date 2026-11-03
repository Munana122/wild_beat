import type { ComponentType, ReactNode } from 'react'
import { LuLayoutDashboard, LuMap, LuCalendarDays, LuTicket, LuMessageSquare, LuImage, LuInbox, LuMail, LuSettings, LuExternalLink } from 'react-icons/lu'
import { useCurrentUser } from '../../lib/auth'
import { Link, useLocation } from '../../lib/router'
import { useDB } from '../../lib/store'
import { SignInPrompt } from '../../components/ui'
import Overview from './Overview'
import ToursAdmin from './ToursAdmin'
import CalendarAdmin from './CalendarAdmin'
import BookingsAdmin from './BookingsAdmin'
import { ReviewsAdmin, GalleryAdmin } from './Moderation'
import { SupportAdmin, SubscribersAdmin } from './Inbox'
import SettingsAdmin from './SettingsAdmin'

type Tab = { id: string; label: string; icon: ComponentType; component: ComponentType; count?: number }

export default function Admin() {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  const pendingBookings = useDB((db) => db.bookings.filter((b) => b.status === 'pending').length)
  const openRequests = useDB((db) => db.supportRequests.filter((r) => !r.reply).length)

  if (!user || user.role !== 'admin') {
    return (
      <section className="container-x flex min-h-[80vh] items-center justify-center pt-24">
        <div className="w-full max-w-md">
          {user ? (
            <div className="card p-8 text-center">
              <h1 className="font-display text-2xl font-semibold">Admins only</h1>
              <p className="mt-2 text-sm text-earth-light">You're signed in as a guest. Log in with an admin account to manage the site.</p>
              <Link to="/login" className="btn-primary mt-6">
                Switch account
              </Link>
            </div>
          ) : (
            <SignInPrompt action="open the admin dashboard" next="/admin" />
          )}
        </div>
      </section>
    )
  }

  const tabs: Tab[] = [
    { id: '', label: 'Overview', icon: LuLayoutDashboard, component: Overview },
    { id: 'tours', label: 'Tours', icon: LuMap, component: ToursAdmin },
    { id: 'calendar', label: 'Calendar', icon: LuCalendarDays, component: CalendarAdmin },
    { id: 'bookings', label: 'Bookings', icon: LuTicket, component: BookingsAdmin, count: pendingBookings },
    { id: 'reviews', label: 'Reviews', icon: LuMessageSquare, component: ReviewsAdmin },
    { id: 'gallery', label: 'Gallery', icon: LuImage, component: GalleryAdmin },
    { id: 'support', label: 'Support', icon: LuInbox, component: SupportAdmin, count: openRequests },
    { id: 'subscribers', label: 'Subscribers', icon: LuMail, component: SubscribersAdmin },
    { id: 'settings', label: 'Settings', icon: LuSettings, component: SettingsAdmin },
  ]
  const current = pathname.replace(/^\/admin\/?/, '')
  const tab = tabs.find((t) => t.id === current) ?? tabs[0]
  const Active = tab.component

  return (
    <div className="min-h-screen bg-cream pt-16 md:pt-20">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <aside className="sticky top-16 z-30 border-b border-earth/10 bg-cream/95 backdrop-blur md:top-20 lg:h-[calc(100vh-5rem)] lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0 lg:bg-transparent">
          <div className="hidden px-6 pt-8 pb-4 lg:block">
            <p className="eyebrow">Admin</p>
            <p className="mt-1 font-display text-xl font-semibold">Hi, {user.name.split(' ')[0]} 👋</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:px-4">
            {tabs.map((t) => {
              const active = t.id === tab.id
              return (
                <Link
                  key={t.id}
                  to={`/admin${t.id ? '/' + t.id : ''}`}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                    active ? 'bg-earth text-cream' : 'text-earth-light hover:bg-cream-dark'
                  }`}
                >
                  <t.icon />
                  {t.label}
                  {!!t.count && <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-sand text-earth' : 'bg-terracotta text-cream'}`}>{t.count}</span>}
                </Link>
              )
            })}
            <Link to="/" className="mt-0 flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap text-earth-light hover:bg-cream-dark lg:mt-6">
              <LuExternalLink /> View website
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Active />
        </div>
      </div>
    </div>
  )
}

export function AdminTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-earth-light">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
