import { useDB, getDB, update, getSessionUserId, setSessionUserId, subscribe } from './store'
import type { Role, User } from './types'
import { uid } from './id'
import { useSyncExternalStore } from 'react'

/**
 * SHA-256 of the admin secret code. Only the hash ships with the site,
 * so the code itself isn't readable in the page source.
 */
const ADMIN_CODE_HASH = 'a601b2e2ecc74178121e9a5a66e09e3d2354d290d18bcbe5001ea1ec08868d9b'

export async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', bytes)
    return toHex(new Uint8Array(buf))
  }
  // crypto.subtle is missing on plain-http LAN addresses (e.g. testing on a phone)
  return toHex(sha256Fallback(bytes))
}

function toHex(b: Uint8Array) {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
}

function sha256Fallback(msg: Uint8Array): Uint8Array {
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ])
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19])
  const l = msg.length
  const withPad = new Uint8Array(((l + 9 + 63) >> 6) << 6)
  withPad.set(msg)
  withPad[l] = 0x80
  const view = new DataView(withPad.buffer)
  view.setUint32(withPad.length - 4, (l * 8) >>> 0)
  view.setUint32(withPad.length - 8, Math.floor((l * 8) / 2 ** 32))
  const W = new Uint32Array(64)
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n))
  for (let off = 0; off < withPad.length; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = view.getUint32(off + i * 4)
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3)
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10)
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, h] = H
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[i] + W[i]) >>> 0
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) >>> 0
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h
  }
  const out = new Uint8Array(32)
  const ov = new DataView(out.buffer)
  H.forEach((v, i) => ov.setUint32(i * 4, v))
  return out
}

const sessionListeners = new Set<() => void>()
function emitSession() {
  sessionListeners.forEach((l) => l())
}

function subscribeSession(l: () => void) {
  sessionListeners.add(l)
  const unsub = subscribe(l)
  return () => {
    sessionListeners.delete(l)
    unsub()
  }
}

export function useCurrentUser(): User | null {
  const id = useSyncExternalStore(subscribeSession, getSessionUserId)
  return useDB((db) => (id ? db.users.find((u) => u.id === id) ?? null : null))
}

export async function signUp(input: { name: string; email: string; password: string; role: Role; adminCode?: string }) {
  const email = input.email.trim().toLowerCase()
  if (!input.name.trim()) throw new Error('Please enter your name.')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.')
  if (input.password.length < 6) throw new Error('Password must be at least 6 characters.')
  if (input.role === 'admin') {
    const hash = await sha256((input.adminCode ?? '').trim())
    if (hash !== ADMIN_CODE_HASH) throw new Error('That admin secret code is not correct.')
  }
  if (getDB().users.some((u) => u.email === email && u.role === input.role)) {
    throw new Error(`An ${input.role} account with this email already exists. Please log in.`)
  }
  const user: User = {
    id: uid(),
    name: input.name.trim(),
    email,
    passwordHash: await sha256(input.password),
    role: input.role,
    createdAt: new Date().toISOString(),
  }
  update((db) => {
    db.users.push(user)
  })
  setSessionUserId(user.id)
  emitSession()
  return user
}

export async function logIn(input: { email: string; password: string; role: Role }) {
  const email = input.email.trim().toLowerCase()
  const hash = await sha256(input.password)
  const user = getDB().users.find((u) => u.email === email && u.role === input.role)
  if (!user || user.passwordHash !== hash) {
    throw new Error(`Incorrect email or password for a ${input.role} account.`)
  }
  setSessionUserId(user.id)
  emitSession()
  return user
}

export function logOut() {
  setSessionUserId(null)
  emitSession()
}
