import { motion } from 'framer-motion'
import { LuClock, LuMapPin, LuUsers, LuCheck, LuArrowLeft, LuBed, LuTicket } from 'react-icons/lu'
import { useDB } from '../lib/store'
import { Link } from '../lib/router'
import { FadeIn, money, Stars } from '../components/ui'
import { TourCard } from '../components/TourCard'
import NotFound from './NotFound'

export default function TourDetail({ slug }: { slug: string }) {
  const tours = useDB((db) => db.tours)
  const reviews = useDB((db) => db.reviews)
  const tour = tours.find((t) => t.slug === slug)
  if (!tour) return <NotFound />
  const tourReviews = reviews.filter((r) => r.tourId === tour.id)
  const avg = tourReviews.length ? tourReviews.reduce((s, r) => s + r.rating, 0) / tourReviews.length : 0
  const others = tours.filter((t) => t.id !== tour.id).slice(0, 3)

  const facts = [
    { icon: LuTicket, label: 'Price', value: `${money(tour.price)} / person` },
    { icon: LuClock, label: 'Length', value: tour.duration },
    { icon: LuMapPin, label: 'Location', value: tour.location },
    { icon: LuUsers, label: 'Group size', value: tour.groupSize },
  ]

  return (
    <>
      <section className="relative isolate flex min-h-[62vh] items-end overflow-hidden pt-24 pb-14">
        <motion.img
          src={tour.image}
          alt={tour.title}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6 }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-earth/95 via-earth/45 to-earth/20" />
        <div className="container-x">
          <Link to="/tours" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-cream/80 hover:text-cream">
            <LuArrowLeft /> All tours
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl font-display text-4xl leading-tight font-semibold text-cream sm:text-5xl md:text-6xl"
          >
            {tour.title}
          </motion.h1>
          <p className="mt-3 max-w-2xl text-lg text-cream/85">{tour.tagline}</p>
          {tourReviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-cream/85">
              <Stars value={Math.round(avg)} size="text-sm" /> <span className="text-sm">({tourReviews.length})</span>
            </div>
          )}
        </div>
      </section>

      <section className="container-x relative z-10 -mt-8">
        <div className="card grid grid-cols-2 gap-px overflow-hidden bg-earth/5 md:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="flex items-center gap-3 bg-white p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sand-light/60 text-lg text-terracotta">
                <f.icon />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-earth/50 uppercase">{f.label}</p>
                <p className="text-sm font-semibold">{f.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_360px] md:py-20">
        <div>
          <FadeIn>
            <h2 className="font-display text-3xl font-semibold">About this tour</h2>
            <p className="mt-4 text-lg leading-relaxed text-earth-light whitespace-pre-line">{tour.description}</p>
          </FadeIn>

          {tour.highlights.length > 0 && (
            <FadeIn className="mt-12">
              <h2 className="font-display text-3xl font-semibold">Highlights</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {tour.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-soft">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-olive text-xs text-cream">
                      <LuCheck />
                    </span>
                    <span className="text-sm">{h}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          )}

          {tour.itinerary.length > 0 && (
            <FadeIn className="mt-12">
              <h2 className="font-display text-3xl font-semibold">Day-by-day plan</h2>
              <ol className="relative mt-6 space-y-6 border-l-2 border-dashed border-sand pl-8">
                {tour.itinerary.map((d, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative"
                  >
                    <span className="absolute top-0 -left-[3.05rem] grid h-9 w-9 place-items-center rounded-full bg-terracotta text-sm font-bold text-cream shadow-soft">
                      {i + 1}
                    </span>
                    <div className="card p-6">
                      <p className="text-xs font-semibold tracking-wider text-terracotta uppercase">Day {i + 1}</p>
                      <h3 className="mt-1 font-display text-xl font-semibold">{d.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-earth-light">{d.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </FadeIn>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card p-7">
            <p className="text-sm text-earth-light">From</p>
            <p className="font-display text-4xl font-semibold text-terracotta">
              {money(tour.price)} <span className="font-sans text-base font-normal text-earth-light">/ person</span>
            </p>
            <Link to={`/book?tour=${tour.id}`} className="btn-primary mt-6 w-full !py-3.5">
              Check dates & book
            </Link>
            <p className="mt-3 text-center text-xs text-earth/60">No payment needed to send a request.</p>
            <div className="mt-6 flex gap-3 rounded-2xl bg-sand-light/40 p-4 text-sm">
              <LuBed className="mt-0.5 shrink-0 text-lg text-olive-dark" />
              <p>Need somewhere to stay? Ilyce will help you find and book accommodation that fits your style and budget.</p>
            </div>
          </div>
        </aside>
      </section>

      {others.length > 0 && (
        <section className="bg-cream-dark/60 py-16 md:py-20">
          <div className="container-x">
            <h2 className="section-title mb-10">You might also love</h2>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((t, i) => (
                <TourCard key={t.id} tour={t} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
