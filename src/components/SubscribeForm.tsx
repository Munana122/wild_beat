import { useState, type FormEvent } from 'react'
import { LuSend } from 'react-icons/lu'
import { update, getDB } from '../lib/store'
import { useCurrentUser } from '../lib/auth'
import { uid } from '../lib/id'
import { toast } from '../lib/toast'
import type { SubscriptionTopic } from '../lib/types'

export function SubscribeForm({ dark = false, defaultTopics = ['news', 'gallery'] }: { dark?: boolean; defaultTopics?: SubscriptionTopic[] }) {
  const user = useCurrentUser()
  const [email, setEmail] = useState(user?.email ?? '')
  const [topics, setTopics] = useState<SubscriptionTopic[]>(defaultTopics)

  const toggle = (t: SubscriptionTopic) => setTopics((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(clean)) return toast('Please enter a valid email address.', 'error')
    if (topics.length === 0) return toast('Pick at least one thing to hear about.', 'error')
    const existing = getDB().subscribers.find((s) => s.email === clean)
    update((db) => {
      if (existing) {
        const s = db.subscribers.find((x) => x.id === existing.id)!
        s.topics = Array.from(new Set([...s.topics, ...topics]))
      } else {
        db.subscribers.push({ id: uid(), email: clean, topics, createdAt: new Date().toISOString() })
      }
    })
    toast(existing ? 'Your subscription has been updated.' : 'Thank you for subscribing! 🌿')
    if (!user) setEmail('')
  }

  const chip = (t: SubscriptionTopic, label: string) => (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        topics.includes(t)
          ? dark
            ? 'border-sand bg-sand/20 text-sand-light'
            : 'border-olive bg-olive/10 text-olive-dark'
          : dark
            ? 'border-cream/20 text-cream/60'
            : 'border-earth/15 text-earth-light'
      }`}
    >
      <input type="checkbox" className="sr-only" checked={topics.includes(t)} onChange={() => toggle(t)} />
      {topics.includes(t) ? '✓' : '+'} {label}
    </label>
  )

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          aria-label="Email address"
          className={`input ${dark ? '!border-cream/20 !bg-cream/10 !text-cream placeholder:!text-cream/40' : ''}`}
        />
        <button className="btn-primary shrink-0 !px-4" aria-label="Subscribe">
          <LuSend />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {chip('news', 'News & tour dates')}
        {chip('gallery', 'New gallery photos')}
      </div>
    </form>
  )
}
