import { useState, type FormEvent } from 'react'
import { useDB, update, resetDB } from '../../lib/store'
import { toast } from '../../lib/toast'
import { ImageInput } from '../../components/ui'
import { DEFAULT_SETTINGS } from '../../lib/seed'
import type { Settings } from '../../lib/types'
import { AdminTitle } from './Admin'
import { navigate } from '../../lib/router'
import { logOut } from '../../lib/auth'

export default function SettingsAdmin() {
  const current = useDB((d) => d.settings)
  const [s, setS] = useState<Settings>(current)
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => ({ ...x, [k]: v }))

  const save = (e: FormEvent) => {
    e.preventDefault()
    for (const k of ['stripeLink', 'paypalLink', 'instagram', 'facebook'] as const) {
      if (s[k] && !/^https?:\/\//.test(s[k])) return toast(`The ${k.replace('Link', '')} link should start with https://`, 'error')
    }
    try {
      update((d) => {
        d.settings = s
      })
      toast('Settings saved.')
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  const field = (k: keyof Settings, label: string, placeholder = '', type = 'text') => (
    <div>
      <label className="label" htmlFor={`st-${k}`}>{label}</label>
      <input id={`st-${k}`} type={type} className="input" value={s[k]} placeholder={placeholder} onChange={(e) => set(k, e.target.value)} />
    </div>
  )

  return (
    <form onSubmit={save}>
      <AdminTitle title="Site settings" subtitle="Photos, contact details, social links and payment details." />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="card space-y-5 p-6">
          <h2 className="font-display text-xl font-semibold">Photos</h2>
          <ImageInput label="Home page background photo" value={s.heroImage} onChange={(v) => set('heroImage', v)} maxSize={2000} />
          <ImageInput label="About photo (your portrait)" value={s.aboutImage} onChange={(v) => set('aboutImage', v)} maxSize={1200} />
          <div>
            <label className="label" htmlFor="st-bio">About me (bio)</label>
            <textarea id="st-bio" rows={10} className="input" value={s.aboutBio} onChange={(e) => set('aboutBio', e.target.value)} />
            <p className="mt-1 text-xs text-earth/50">Leave an empty line between paragraphs.</p>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">Contact & social</h2>
            {field('phone', 'Phone / WhatsApp')}
            {field('email', 'Email', '', 'email')}
            {field('address', 'Address')}
            {field('instagram', 'Instagram link', 'https://www.instagram.com/…')}
            {field('facebook', 'Facebook link', 'https://www.facebook.com/…')}
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-display text-xl font-semibold">Payments (Support Her Mission)</h2>
            <div>
              {field('stripeLink', 'Stripe Payment Link (card, Apple Pay, Google Pay)', 'https://buy.stripe.com/…')}
              <p className="mt-1 text-xs text-earth/60">
                In Stripe, create a Payment Link with “Let customers choose what to pay”, then paste it here. Until it’s set, card and wallet options show a friendly “coming soon” note.
              </p>
            </div>
            <div>
              {field('paypalLink', 'PayPal.Me link', 'https://paypal.me/yourname')}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('mpesaNumber', 'M-Pesa number')}
              {field('mpesaName', 'M-Pesa name')}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('bankName', 'Bank name')}
              {field('bankCurrency', 'Account currency')}
              {field('bankAccount', 'Account number')}
              {field('bankAccountName', 'Account name')}
            </div>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 flex flex-wrap gap-3 border-t border-earth/10 bg-cream/95 py-4 backdrop-blur">
        <button className="btn-primary">Save settings</button>
        <button type="button" className="btn-ghost" onClick={() => setS({ ...DEFAULT_SETTINGS, ...current, heroImage: DEFAULT_SETTINGS.heroImage, aboutImage: DEFAULT_SETTINGS.aboutImage })}>
          Restore default photos
        </button>
        <button
          type="button"
          className="btn-ghost ml-auto !text-terracotta"
          onClick={() => {
            if (!confirm('Reset ALL website data (tours, bookings, reviews, photos, accounts) to the starting state? This cannot be undone.')) return
            resetDB()
            logOut()
            navigate('/')
          }}
        >
          Reset all data
        </button>
      </div>
    </form>
  )
}
