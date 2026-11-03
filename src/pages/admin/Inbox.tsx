import { useState } from 'react'
import { LuSend, LuTrash2, LuMail, LuDownload, LuCopy } from 'react-icons/lu'
import { useDB, update } from '../../lib/store'
import { formatDateTime } from '../../lib/dates'
import { toast } from '../../lib/toast'
import type { SupportRequest } from '../../lib/types'
import { AdminTitle } from './Admin'
import { downloadCSV } from './csv'

export function SupportAdmin() {
  const requests = useDB((d) => d.supportRequests)
  const sorted = [...requests].sort((a, b) => Number(!!a.reply) - Number(!!b.reply) || b.createdAt.localeCompare(a.createdAt))
  return (
    <>
      <AdminTitle title="Support requests" subtitle="Questions sent by signed-in guests. Your reply appears on their Support page." />
      {sorted.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No support requests yet.</p>
      ) : (
        <div className="grid gap-4">
          {sorted.map((r) => (
            <RequestCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </>
  )
}

function RequestCard({ r }: { r: SupportRequest }) {
  const [reply, setReply] = useState(r.reply ?? '')
  const send = () => {
    if (!reply.trim()) return toast('Write a reply first.', 'error')
    update((d) => {
      const x = d.supportRequests.find((y) => y.id === r.id)
      if (x) {
        x.reply = reply.trim()
        x.repliedAt = new Date().toISOString()
      }
    })
    toast('Reply saved. The guest will see it on their Support page.')
  }
  const mailto = `mailto:${r.email}?subject=${encodeURIComponent('Re: ' + r.subject)}&body=${encodeURIComponent(reply)}`
  return (
    <article className="card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-semibold">{r.subject}</p>
          <p className="text-xs text-earth/50">
            {r.name} · {r.email} · {formatDateTime(r.createdAt)}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.reply ? 'bg-olive/15 text-olive-dark' : 'bg-terracotta/15 text-terracotta'}`}>{r.reply ? 'Answered' : 'New'}</span>
      </div>
      <p className="mt-3 rounded-xl bg-cream p-4 text-sm whitespace-pre-line">{r.message}</p>
      <textarea rows={3} className="input mt-4" placeholder="Write your reply…" value={reply} onChange={(e) => setReply(e.target.value)} aria-label="Reply" />
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-primary !py-2" onClick={send}>
          <LuSend /> {r.reply ? 'Update reply' : 'Send reply'}
        </button>
        <a className="btn-ghost !py-2" href={mailto}>
          <LuMail /> Also email it
        </a>
        <button
          className="btn-ghost ml-auto !px-3 !py-2 hover:!border-terracotta hover:!text-terracotta"
          aria-label="Delete request"
          onClick={() => {
            if (!confirm('Delete this request?')) return
            update((d) => {
              d.supportRequests = d.supportRequests.filter((x) => x.id !== r.id)
            })
          }}
        >
          <LuTrash2 />
        </button>
      </div>
    </article>
  )
}

export function SubscribersAdmin() {
  const subs = useDB((d) => d.subscribers)
  const sorted = [...subs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const emails = (topic?: 'news' | 'gallery') => sorted.filter((s) => !topic || s.topics.includes(topic)).map((s) => s.email)

  const copy = async (list: string[]) => {
    try {
      await navigator.clipboard.writeText(list.join(', '))
      toast(`Copied ${list.length} email${list.length === 1 ? '' : 's'}.`)
    } catch {
      toast('Copy not available in this browser.', 'error')
    }
  }

  return (
    <>
      <AdminTitle
        title="Newsletter subscribers"
        subtitle={`${subs.length} people want to hear from you.`}
        action={
          subs.length > 0 && (
            <button
              className="btn-ghost"
              onClick={() =>
                downloadCSV(
                  'wildbeat-subscribers.csv',
                  sorted.map((s) => ({ Email: s.email, News: s.topics.includes('news') ? 'Yes' : 'No', 'Gallery photos': s.topics.includes('gallery') ? 'Yes' : 'No', Joined: s.createdAt })),
                )
              }
            >
              <LuDownload /> Export CSV
            </button>
          )
        }
      />
      {subs.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button className="btn-ghost !py-2" onClick={() => copy(emails('news'))}>
            <LuCopy /> Copy news emails ({emails('news').length})
          </button>
          <button className="btn-ghost !py-2" onClick={() => copy(emails('gallery'))}>
            <LuCopy /> Copy gallery emails ({emails('gallery').length})
          </button>
        </div>
      )}
      {sorted.length === 0 ? (
        <p className="card p-6 text-sm text-earth-light">No subscribers yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-earth/10 text-xs tracking-wider text-earth/50 uppercase">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Interested in</th>
                <th className="p-4">Joined</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-earth/5">
              {sorted.map((s) => (
                <tr key={s.id}>
                  <td className="p-4 font-medium">{s.email}</td>
                  <td className="p-4">
                    <div className="flex gap-1.5">
                      {s.topics.map((t) => (
                        <span key={t} className="rounded-full bg-sand-light/70 px-2.5 py-0.5 text-xs">
                          {t === 'news' ? 'News' : 'Gallery'}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-earth-light">{formatDateTime(s.createdAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      className="rounded-full p-2 text-earth/50 hover:text-terracotta"
                      aria-label="Remove subscriber"
                      onClick={() =>
                        update((d) => {
                          d.subscribers = d.subscribers.filter((x) => x.id !== s.id)
                        })
                      }
                    >
                      <LuTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
