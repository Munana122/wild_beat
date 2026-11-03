import { motion } from 'framer-motion'
import { LuClock, LuMapPin, LuUsers, LuArrowRight } from 'react-icons/lu'
import { Link } from '../lib/router'
import type { Tour } from '../lib/types'
import { money } from './ui'

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group card flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lift"
    >
      <Link to={`/tours/${tour.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 rounded-full bg-cream/95 px-3 py-1 text-xs font-semibold text-earth shadow-soft">{tour.duration}</span>
        <span className="absolute right-4 bottom-4 rounded-full bg-terracotta px-4 py-1.5 text-sm font-semibold text-cream shadow-soft">
          from {money(tour.price)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-snug font-semibold">
          <Link to={`/tours/${tour.slug}`} className="hover:text-terracotta">
            {tour.title}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-earth-light">{tour.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-earth-light">
          <span className="flex items-center gap-1.5">
            <LuMapPin className="text-olive" /> {tour.location}
          </span>
          <span className="flex items-center gap-1.5">
            <LuClock className="text-olive" /> {tour.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <LuUsers className="text-olive" /> {tour.groupSize}
          </span>
        </div>
        <div className="mt-auto flex items-center gap-3 pt-6">
          <Link to={`/tours/${tour.slug}`} className="flex items-center gap-1.5 text-sm font-semibold text-terracotta hover:gap-2.5 transition-all">
            View details <LuArrowRight />
          </Link>
          <Link to={`/book?tour=${tour.id}`} className="btn-sand ml-auto !px-4 !py-2">
            Book
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
