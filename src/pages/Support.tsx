import { useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuCreditCard, LuSmartphone, LuWallet, LuLandmark, LuCopy, LuCheck, LuHeart, LuExternalLink, LuSend, LuInbox } from 'react-icons/lu'
import { FaPaypal } from 'react-icons/fa'
import { useDB, update } from '../lib/store'
import { useCurrentUser } from '../lib/auth'
import { uid } from '../lib/id'
import { toast } from '../lib/toast'
import { formatDateTime } from '../lib/dates'
import { PageHeader, SignInPrompt, FadeIn } from '../components/ui'

type Method = 'card' | 'wallet' | 'paypal' | 'mpesa' | 'bank'

const METHODS: { id: Method; label: string; icon: ReactNode }[] = [
  { id: 'card', label: 'Card', icon: <LuCreditCard /> },
  { id: 'wallet', label: 'Apple / Google Pay', icon: <LuWallet /> },
  { id: 'paypal', label: 'PayPal', icon: <FaPaypal /> },
  { id: 'mpesa', label: 'M-Pesa', icon: <LuSmartphone /> },
  { id: 'bank', label: 'Bank transfer', icon: <LuLandmark /> },
]

const PRESETS = [10, 25, 50, 100]

export default function Support() {
  const s = useDB((db) => db.settings)
  const tours = useDB((db) => db.tours)
  const [amount, setAmount] = useState('25')
  const [method, setMethod] = useState<Method>('card')
  const value = Number(amount)
  const valid = Number.isFinite(value) && value >= 1

  const stripeUrl = () => {
    if (!s.stripeLink) return ''
    const u = new URL(s.stripeLink)
    u.searchParams.set('__prefilled_amount', String(Math.round(value * 100)))
    return u.toString()
  }
  const paypalUrl = () => {
    if (!s.paypalLink) return ''
    const base = s.paypalLink.replace(/\/+$/, '')
    return /paypal\.me/i.test(base) ? `${base}/${value}USD` : base
  }

  return (
    <>
      <PageHeader
        eyebrow="Support her mission"
        title="Help Ilyce open the road for others"
        subtitle="Your gift helps Ilyce keep her vehicle safe, keep growing as a guide, and open the door for more Rwandan women in tourism."
        image={tours[0]?.image ?? s.heroImage}
      />

      <section className="container-x grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.15fr]">
        <FadeIn>
          <p className="eyebrow">Why it matters</p>
          <h2 className="section-title mt-3">Every gift, big or small, makes a difference</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-earth-light">
            <p>
              Ilyce is one of very few women working as licensed driver-guides in Rwanda. Your support goes directly to her — no middle company — and helps with vehicle upkeep, training, and her dream of mentoring young Rwandan women into guiding.
            </p>
            <p>Choose any amount you like and the payment method that is easiest for you. Thank you — murakoze cyane! 💛</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              ['Safe', 'vehicle upkeep'],
              ['Growth', 'training & licences'],
              ['Mentoring', 'women in tourism'],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl bg-white p-4 shadow-soft">
                <p className="font-display text-lg font-semibold text-terracotta">{a}</p>
                <p className="text-xs text-earth-light">{b}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="card p-6 md:p-8">
            <label htmlFor="amount" className="label">
              Your gift (USD)
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-5 -translate-y-1/2 font-display text-3xl text-earth/50">$</span>
              <input
                id="amount"
                inputMode="decimal"
                className="input !py-4 !pl-11 font-display !text-3xl"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder="Any amount"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${value === p ? 'bg-earth text-cream' : 'bg-cream-dark hover:bg-sand-light'}`}
                >
                  ${p}
                </button>
              ))}
            </div>

            <p className="label mt-7">Payment method</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition ${
                    method === m.id ? 'border-terracotta bg-terracotta/5 text-terracotta' : 'border-earth/10 hover:border-sand'
                  }`}
                >
                  <span className="text-lg">{m.icon}</span> {m.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={method} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl bg-cream p-5">
                {(method === 'card' || method === 'wallet') &&
                  (s.stripeLink ? (
                    <div className="space-y-3">
                      <p className="text-sm text-earth-light">
                        {method === 'card'
                          ? 'You’ll be taken to Stripe’s secure checkout to pay by Visa, Mastercard or Amex.'
                          : 'Stripe’s secure checkout shows Apple Pay or Google Pay automatically on supported devices.'}
                      </p>
                      <a
                        href={valid ? stripeUrl() : undefined}
                        target="_blank"
                        rel="noreferrer"
                        aria-disabled={!valid}
                        className={`btn-primary w-full !py-3.5 ${!valid ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <LuHeart /> Give ${valid ? value : '…'} securely with Stripe <LuExternalLink />
                      </a>
                    </div>
                  ) : (
                    <NotReady label="Card and wallet payments" />
                  ))}

                {method === 'paypal' &&
                  (s.paypalLink ? (
                    <div className="space-y-3">
                      <p className="text-sm text-earth-light">Send your gift through PayPal using your PayPal balance or card.</p>
                      <a href={valid ? paypalUrl() : undefined} target="_blank" rel="noreferrer" className={`btn-primary w-full !py-3.5 ${!valid ? 'pointer-events-none opacity-50' : ''}`}>
                        <FaPaypal /> Give ${valid ? value : '…'} with PayPal <LuExternalLink />
                      </a>
                    </div>
                  ) : (
                    <NotReady label="PayPal" />
                  ))}

                {method === 'mpesa' && (
                  <div className="space-y-3 text-sm">
                    <p className="text-earth-light">Send money with M-Pesa (or your mobile-money app) to:</p>
                    <CopyRow label="Number" value={s.mpesaNumber} />
                    <CopyRow label="Name" value={s.mpesaName} />
                    {valid && <CopyRow label="Amount" value={`$${value} (or equivalent)`} />}
                    <p className="text-xs text-earth/60">Please add “Wildbeat support” as the reference if your app allows it.</p>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="space-y-3 text-sm">
                    <p className="text-earth-light">Send an international or local transfer to:</p>
                    <CopyRow label="Bank" value={s.bankName} />
                    <CopyRow label={`${s.bankCurrency} account`} value={s.bankAccount} />
                    <CopyRow label="Account name" value={s.bankAccountName} />
                    {valid && <CopyRow label="Amount" value={`${s.bankCurrency} ${value}`} />}
                    <p className="text-xs text-earth/60">Use “Wildbeat support” as the payment reference.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
      </section>

      <SupportRequests />
    </>
  )
}

function NotReady({ label }: { label: string }) {
  const s = useDB((db) => db.settings)
  return (
    <p className="text-sm text-earth-light">
      {label} are being set up. In the meantime you can use <strong>bank transfer</strong> or <strong>M-Pesa</strong>, or contact Ilyce at{' '}
      <a className="font-medium text-terracotta" href={`mailto:${s.email}`}>
        {s.email}
      </a>
      .
    </p>
  )
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-soft">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-wider text-earth/50 uppercase">{label}</p>
        <p className="font-semibold break-all">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            toast('Copy not available — please select the text instead.', 'error')
          }
        }}
        className="shrink-0 rounded-full p-2 text-earth-light hover:bg-cream-dark hover:text-terracotta"
        aria-label={`Copy ${label}`}
      >
        {copied ? <LuCheck className="text-olive" /> : <LuCopy />}
      </button>
    </div>
  )
}

function SupportRequests() {
  const user = useCurrentUser()
  const requests = useDB((db) => db.supportRequests)
  const mine = user ? requests.filter((r) => r.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : []
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!subject.trim() || message.trim().length < 5) return toast('Please add a subject and a short message.', 'error')
    update((db) => {
      db.supportRequests.push({
        id: uid(),
        userId: user.id,
        name: user.name,
        email: user.email,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        reply: null,
        repliedAt: null,
      })
    })
    setSubject('')
    setMessage('')
    toast('Your request was sent to Ilyce.')
  }

  return (
    <section className="bg-cream-dark/60 py-16 md:py-20">
      <div className="container-x grid gap-10 lg:grid-cols-2">
        <FadeIn>
          <p className="eyebrow">Support requests</p>
          <h2 className="section-title mt-3">Need help or have a question?</h2>
          <p className="mt-4 max-w-lg text-earth-light">
            Ask about a payment, a booking, accommodation or anything else. Ilyce answers every message personally, and her reply will appear here.
          </p>
        </FadeIn>
        <div>
          {user ? (
            <form onSubmit={submit} className="card space-y-4 p-6 md:p-8">
              <div>
                <label className="label" htmlFor="s-sub">Subject</label>
                <input id="s-sub" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Confirming my bank transfer" />
              </div>
              <div>
                <label className="label" htmlFor="s-msg">Message</label>
                <textarea id="s-msg" rows={4} className="input" value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <button className="btn-primary">
                <LuSend /> Send request
              </button>
            </form>
          ) : (
            <SignInPrompt action="send a support request" next="/support" />
          )}

          {mine.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
                <LuInbox /> Your requests
              </h3>
              {mine.map((r) => (
                <div key={r.id} className="card p-5 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{r.subject}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.reply ? 'bg-olive/15 text-olive-dark' : 'bg-sand-light text-earth'}`}>
                      {r.reply ? 'Answered' : 'Waiting for reply'}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-earth-light">{r.message}</p>
                  <p className="mt-1 text-xs text-earth/50">{formatDateTime(r.createdAt)}</p>
                  {r.reply && (
                    <div className="mt-4 rounded-xl border-l-4 border-olive bg-olive/5 p-4">
                      <p className="text-xs font-semibold text-olive-dark">Ilyce replied · {r.repliedAt && formatDateTime(r.repliedAt)}</p>
                      <p className="mt-1 whitespace-pre-line">{r.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
