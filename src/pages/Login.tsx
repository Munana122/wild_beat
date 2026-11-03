import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuUser, LuShieldCheck, LuEye, LuEyeOff } from 'react-icons/lu'
import { logIn, signUp, useCurrentUser } from '../lib/auth'
import { navigate, useLocation, Link } from '../lib/router'
import { useDB } from '../lib/store'
import { toast } from '../lib/toast'
import { Logo } from '../components/Logo'
import type { Role } from '../lib/types'

export default function Login() {
  const { search } = useLocation()
  const settings = useDB((db) => db.settings)
  const current = useCurrentUser()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<Role>('guest')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const next = search.get('next')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = mode === 'login' ? await logIn({ email, password, role }) : await signUp({ name, email, password, role, adminCode })
      toast(mode === 'login' ? `Welcome back, ${user.name.split(' ')[0]}!` : `Welcome to Wildbeat, ${user.name.split(' ')[0]}!`)
      navigate(user.role === 'admin' ? '/admin' : next && next.startsWith('/') ? next : '/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="relative isolate flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <img src={settings.heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-earth/70 backdrop-blur-[2px]" />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl bg-cream p-7 shadow-lift sm:p-9">
        <div className="flex justify-center">
          <Logo />
        </div>

        {current && (
          <p className="mt-5 rounded-xl bg-sand-light/50 p-3 text-center text-sm">
            You're signed in as <strong>{current.name}</strong>.{' '}
            <Link to={current.role === 'admin' ? '/admin' : '/'} className="font-semibold text-terracotta">
              Continue
            </Link>
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 rounded-full bg-cream-dark p-1" role="tablist" aria-label="Account type">
          {(['guest', 'admin'] as Role[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              type="button"
              onClick={() => {
                setRole(r)
                setError('')
              }}
              className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition ${role === r ? 'bg-white text-earth shadow-soft' : 'text-earth/60'}`}
            >
              {r === 'guest' ? <LuUser /> : <LuShieldCheck />} {r === 'guest' ? 'Guest' : 'Admin'}
            </button>
          ))}
        </div>

        <h1 className="mt-7 text-center font-display text-3xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-1 text-center text-sm text-earth-light">
          {role === 'guest'
            ? mode === 'login'
              ? 'Log in to book, review and share your photos.'
              : 'Join to book tours, leave reviews and share trip photos.'
            : mode === 'login'
              ? 'Admin access to the Wildbeat dashboard.'
              : 'Admin accounts need the secret code.'}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <AnimatePresence initial={false}>
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="label" htmlFor="l-name">Full name</label>
                <input id="l-name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="label" htmlFor="l-email">Email</label>
            <input id="l-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="l-pw">Password</label>
            <div className="relative">
              <input
                id="l-pw"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="input !pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-earth/50" aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {mode === 'signup' && role === 'admin' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="label" htmlFor="l-code">Admin secret code</label>
                <input id="l-code" inputMode="numeric" className="input tracking-[0.3em]" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta-dark" role="alert">{error}</p>}

          <button className="btn-primary w-full !py-3.5" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-earth-light">
          {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError('')
            }}
            className="font-semibold text-terracotta hover:underline"
          >
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </section>
  )
}
