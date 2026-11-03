import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuMenu, LuX, LuLogOut, LuLayoutDashboard, LuUser } from 'react-icons/lu'
import { Link, useLocation, navigate } from '../lib/router'
import { useCurrentUser, logOut } from '../lib/auth'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tours', label: 'Tours' },
  { to: '/book', label: 'Book' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/support', label: 'Support Her Mission' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const user = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const overHero = pathname === '/' && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const isActive = (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        overHero ? 'bg-transparent' : 'bg-cream/95 shadow-soft backdrop-blur'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" aria-label="Wildbeat home">
          <Logo light={overHero} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  isActive(l.to)
                    ? overHero
                      ? 'bg-cream/20 text-cream'
                      : 'bg-sand-light/60 text-earth'
                    : overHero
                      ? 'text-cream/90 hover:text-cream'
                      : 'text-earth-light hover:text-terracotta'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className={overHero ? 'btn-outline !px-4 !py-2' : 'btn-ghost !px-4 !py-2'}>
                  <LuLayoutDashboard /> Dashboard
                </Link>
              )}
              <span className={`flex items-center gap-1.5 text-sm ${overHero ? 'text-cream' : 'text-earth-light'}`}>
                <LuUser /> {user.name.split(' ')[0]}
              </span>
              <button
                onClick={() => {
                  logOut()
                  navigate('/')
                }}
                className={`rounded-full p-2 transition ${overHero ? 'text-cream hover:bg-cream/20' : 'text-earth-light hover:bg-sand-light/50'}`}
                aria-label="Log out"
                title="Log out"
              >
                <LuLogOut />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-5 !py-2.5">
              Log in / Sign up
            </Link>
          )}
        </div>

        <button
          className={`rounded-full p-2 text-2xl lg:hidden ${overHero ? 'text-cream' : 'text-earth'}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <LuX /> : <LuMenu />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-earth/10 bg-cream lg:hidden"
          >
            <ul className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className={`block rounded-xl px-4 py-3 font-medium ${isActive(l.to) ? 'bg-sand-light/60 text-earth' : 'text-earth-light'}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-earth/10 pt-3">
                {user ? (
                  <div className="flex flex-wrap items-center gap-2 px-2">
                    <span className="mr-auto text-sm text-earth-light">Signed in as {user.name}</span>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="btn-ghost !py-2">
                        <LuLayoutDashboard /> Dashboard
                      </Link>
                    )}
                    <button
                      className="btn-ghost !py-2"
                      onClick={() => {
                        logOut()
                        navigate('/')
                      }}
                    >
                      <LuLogOut /> Log out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="btn-primary w-full">
                    Log in / Sign up
                  </Link>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
