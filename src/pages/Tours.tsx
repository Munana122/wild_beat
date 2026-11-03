import { useDB } from '../lib/store'
import { TourCard } from '../components/TourCard'
import { PageHeader, FadeIn, EmptyState } from '../components/ui'
import { CTA } from './Home'
import { LuMap } from 'react-icons/lu'

export default function Tours() {
  const tours = useDB((db) => db.tours)
  const settings = useDB((db) => db.settings)
  return (
    <>
      <PageHeader
        eyebrow="Tours & safaris"
        title="Journeys through the land of a thousand hills"
        subtitle="Private tours with a licensed driver-guide. Every itinerary can be adjusted to your pace, interests and budget."
        image={tours[0]?.image ?? settings.heroImage}
      />
      <section className="container-x py-16 md:py-24">
        {tours.length === 0 ? (
          <EmptyState icon={<LuMap />} title="New tours coming soon">
            Ilyce is preparing new adventures. Please check back shortly or get in touch.
          </EmptyState>
        ) : (
          <>
            <FadeIn className="mb-10 max-w-2xl">
              <p className="text-earth-light">
                Prices are per person and include your private vehicle, fuel, bottled water and Ilyce as your driver-guide. Park permits and lodging can be arranged for you.
              </p>
            </FadeIn>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((t, i) => (
                <TourCard key={t.id} tour={t} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
      <CTA image={settings.heroImage} />
    </>
  )
}
