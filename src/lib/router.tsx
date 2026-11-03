/** Tiny dependency-free router using the History API. */
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react'

const listeners = new Set<() => void>()

function subscribe(l: () => void) {
  listeners.add(l)
  window.addEventListener('popstate', l)
  return () => {
    listeners.delete(l)
    window.removeEventListener('popstate', l)
  }
}

const getLocation = () => window.location.pathname + window.location.search

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === getLocation()) return
  if (opts.replace) window.history.replaceState(null, '', to)
  else window.history.pushState(null, '', to)
  listeners.forEach((l) => l())
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}

export function useLocation() {
  const loc = useSyncExternalStore(subscribe, getLocation)
  const url = new URL(loc, window.location.origin)
  return { pathname: url.pathname.replace(/\/+$/, '') || '/', search: url.searchParams }
}

/** Match "/tours/:slug" against a pathname. */
export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const s = pathname.split('/').filter(Boolean)
  if (p.length !== s.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i])
    else if (p[i] !== s[i]) return null
  }
  return params
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const [path, hash] = to.split('#')
    navigate(path || window.location.pathname)
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 60)
  }
  return <a href={to} onClick={handle} {...rest} />
}
