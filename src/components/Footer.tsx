import { LuInstagram, LuFacebook, LuPhone, LuMail, LuMapPin } from 'react-icons/lu'
import { Link } from '../lib/router'
import { useDB } from '../lib/store'
import { Logo } from './Logo'
import { SubscribeForm } from './SubscribeForm'

export function Footer() {
  const s = useDB((db) => db.settings)
  const tel = s.phone.replace(/[^+\d]/g, '')
  return (
    <footer className="bg-earth text-cream/80">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Personal, safe and unforgettable journeys through Rwanda with Ilyce “Wildbeat” Umuhoza, your certified and licensed driver-guide.
          </p>
          <div className="mt-5 flex gap-2">
            {s.instagram && (
              <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 text-lg transition hover:bg-terracotta">
                <LuInstagram />
              </a>
            )}
            {s.facebook && (
              <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 text-lg transition hover:bg-terracotta">
                <LuFacebook />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg text-cream">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['/tours', 'Tours'],
              ['/book', 'Book a tour'],
              ['/gallery', 'Guest gallery'],
              ['/reviews', 'Reviews'],
              ['/support', 'Support her mission'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition hover:text-sand">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-cream">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:${tel}`} className="flex items-center gap-2.5 hover:text-sand">
                <LuPhone className="text-sand" /> {s.phone}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${tel.replace('+', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-sand">
                <span className="w-4 text-center text-sand">✆</span> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${s.email}`} className="flex items-center gap-2.5 break-all hover:text-sand">
                <LuMail className="shrink-0 text-sand" /> {s.email}
              </a>
            </li>
            {s.address && (
              <li className="flex items-center gap-2.5">
                <LuMapPin className="text-sand" /> {s.address}
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-cream">Stay in the loop</h3>
          <p className="mt-4 mb-3 text-sm">News, tour dates and new guest photos, straight to your inbox.</p>
          <SubscribeForm dark />
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-cream/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Wildbeat Tours · Ilyce Umuhoza</p>
          <p>Made with love in Rwanda 🇷🇼</p>
        </div>
      </div>
    </footer>
  )
}
