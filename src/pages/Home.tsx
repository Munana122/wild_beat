import { motion } from 'framer-motion'
import { LuShieldCheck, LuHeart, LuCompass, LuBed, LuArrowRight, LuQuote, LuMessageSquare, LuAward, LuPhone } from 'react-icons/lu'
import { Link } from '../lib/router'
import { useDB } from '../lib/store'
import { TourCard } from '../components/TourCard'
import { FadeIn, Stars } from '../components/ui'
import { formatDate } from '../lib/dates'

const HIGHLIGHTS = [
  {
    icon: LuShieldCheck,
    title: 'Licensed Guide',
    text: 'Certified and licensed by the Rwanda Development Board, with a safe, well-kept vehicle and careful driving on every road.',
  },
  {
    icon: LuHeart,
    title: 'Passion for Wildlife',
    text: 'From silverback gorillas to Akagera’s lions, Ilyce loves sharing the animals of Rwanda and how to protect them.',
  },
  {
    icon: LuCompass,
    title: 'Local Expertise',
    text: 'Born and raised in Rwanda — the history, the language, the food and the hidden spots most visitors never find.',
  },
  {
    icon: LuBed,
    title: 'Accommodation Help',
    text: 'Help choosing and booking the right place to stay, from cosy guesthouses to eco-lodges, to fit your budget.',
  },
]

export default function Home() {
  const settings = useDB((db) => db.settings)
  const tours = useDB((db) => db.tours)
  const reviews = useDB((db) => db.reviews)
  const featured = (tours.filter((t) => t.featured).length ? tours.filter((t) => t.featured) : tours).slice(0, 3)
  const latestReviews = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const tourName = (id: string | null) => tours.find((t) => t.id === id)?.title
  const bio = settings.aboutBio.split(/\n\s*\n/)

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <motion.img
          src={settings.heroImage}
          alt="Rwandan landscape at sunrise"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-earth/60 via-earth/35 to-earth/85" />
        <div className="container-x pt-24 pb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-xs font-semibold tracking-[0.3em] text-sand-light uppercase sm:text-sm"
          >
            Tours with Ilyce “Wildbeat” Umuhoza
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="mt-4 max-w-4xl font-display text-5xl leading-[1.05] font-semibold text-cream sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Discover Rwanda’s <em className="text-sand not-italic sm:italic">Wild</em> Beauty
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.8 }}
            className="mt-6 max-w-xl text-lg text-cream/90 md:text-xl"
          >
            Gorillas in the mist, lions on the savannah and the warm heart of Kigali — explored with a certified female driver-guide who treats every guest like family.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Link to="/tours" className="btn-primary !px-7 !py-3.5 text-base">
              Explore Tours <LuArrowRight />
            </Link>
            <Link to="/gallery" className="btn-outline !px-7 !py-3.5 text-base">
              View Gallery
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="block h-10 w-6 rounded-full border-2 border-cream/60">
            <span className="mx-auto mt-2 block h-2 w-1 rounded-full bg-cream/80" />
          </span>
        </motion.div>
      </section>

      {/* FEATURED TOURS */}
      <section className="container-x py-20 md:py-28">
        <FadeIn className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Featured adventures</p>
            <h2 className="section-title mt-3">Tours made with care</h2>
            <p className="mt-3 max-w-xl text-earth-light">Every trip is private and paced around you — perfect for families, couples, solo travellers and older guests alike.</p>
          </div>
          <Link to="/tours" className="btn-ghost self-start md:self-auto">
            All tours <LuArrowRight />
          </Link>
        </FadeIn>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t, i) => (
            <TourCard key={t.id} tour={t} index={i} />
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-cream-dark/60 py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <FadeIn className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -top-4 -left-4 h-full w-full rounded-[2rem] bg-olive/25" aria-hidden />
            <img src={settings.aboutImage} alt="Ilyce “Wildbeat” Umuhoza" className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-lift" />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="absolute -right-3 -bottom-6 flex items-center gap-3 rounded-2xl bg-terracotta px-5 py-4 text-cream shadow-lift sm:-right-6"
            >
              <LuAward className="text-3xl text-sand-light" />
              <div className="leading-tight">
                <p className="font-display text-3xl font-semibold">5+</p>
                <p className="text-xs font-medium tracking-wide uppercase">Years of Experience</p>
              </div>
            </motion.div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="eyebrow">Meet your guide</p>
            <h2 className="section-title mt-3">
              Hello, I’m Ilyce — <span className="text-terracotta italic">“Wildbeat”</span>
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-earth-light">
              {bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="btn-primary">
                Plan a trip with me
              </Link>
              <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="btn-ghost">
                <LuPhone /> {settings.phone}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="container-x py-20 md:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why travel with Wildbeat</p>
          <h2 className="section-title mt-3">Safe hands, open heart</h2>
        </FadeIn>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h, i) => (
            <FadeIn key={h.title} delay={i * 0.08}>
              <div className="card h-full p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand-light/60 text-2xl text-terracotta">
                  <h.icon />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-earth-light">{h.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-olive-dark py-20 text-cream md:py-28">
        <div className="container-x">
          <FadeIn className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-sand uppercase">Guest reviews</p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl md:text-5xl">Stories from the road</h2>
              {reviews.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-cream/80">
                  <Stars value={Math.round(avg)} /> <span className="text-sm">{avg.toFixed(1)} from {reviews.length} review{reviews.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            <Link to="/reviews" className="btn-sand self-start md:self-auto">
              {reviews.length ? 'Read all reviews' : 'Write a review'} <LuArrowRight />
            </Link>
          </FadeIn>
          {latestReviews.length === 0 ? (
            <div className="rounded-3xl border border-cream/15 bg-cream/5 p-10 text-center">
              <LuMessageSquare className="mx-auto text-4xl text-sand" />
              <p className="mt-4 font-display text-2xl">Be the first to share your story</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-cream/70">Travelled with Ilyce? Your review helps other families and adventurers choose their guide with confidence.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {latestReviews.map((r, i) => (
                <FadeIn key={r.id} delay={i * 0.08}>
                  <figure className="flex h-full flex-col rounded-3xl bg-cream p-7 text-earth shadow-lift">
                    <LuQuote className="text-3xl text-sand" />
                    <Stars value={r.rating} size="text-sm" />
                    <blockquote className="mt-3 line-clamp-6 flex-1 leading-relaxed text-earth-light">{r.text}</blockquote>
                    <figcaption className="mt-5 border-t border-earth/10 pt-4">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-earth/60">
                        {tourName(r.tourId) ?? 'Wildbeat guest'} · {formatDate(r.createdAt.slice(0, 10), { month: 'short', year: 'numeric' })}
                      </p>
                    </figcaption>
                  </figure>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <CTA image={settings.heroImage} />
    </>
  )
}

export function CTA({ image }: { image: string }) {
  return (
    <section className="container-x py-20 md:py-28">
      <FadeIn>
        <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-lift sm:px-12 md:py-24">
          <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-terracotta/90 via-earth/80 to-olive-dark/90" />
          <h2 className="font-display text-4xl font-semibold text-cream md:text-6xl">Ready for Your Adventure?</h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/85 md:text-lg">
            Pick your dates, tell Ilyce what you dream of seeing, and she’ll take care of the rest — including where you’ll stay.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/book" className="btn-sand !px-7 !py-3.5 text-base">
              Book your tour
            </Link>
            <Link to="/tours" className="btn-outline !px-7 !py-3.5 text-base">
              Browse tours
            </Link>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}

