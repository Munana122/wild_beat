import type { DB, Settings, Slot, Tour } from './types'
import { addDays, toISODate } from './dates'
import { uid } from './id'

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`

export const IMAGES = {
  hero: img('photo-1511283878565-0833bf39de9d', 2200),
  about: img('photo-1651860282296-47055c68580e', 1200),
  akagera: img('photo-1665070385454-5e0c4421a38c'),
  nyungwe: img('photo-1489640818597-89b1edc97db5'),
  gorilla: img('photo-1605559911928-e03606ea0dc0'),
  kigali: img('photo-1687986261123-b17f08f2796c'),
  cta: img('photo-1651860282296-47055c68580e', 2000),
}

export const DEFAULT_BIO = `Muraho, and welcome! I'm Ilyce Umuhoza, known to my guests as "Wildbeat" — a certified, licensed driver-guide born and raised in Rwanda, the land of a thousand hills.

For more than five years I have been driving travellers along Rwanda's winding roads, from the savannah of Akagera to the misty rainforest of Nyungwe and the volcano slopes where mountain gorillas live. Every journey is personal to me: I plan the pace around you, whether you are a family with young children, a group of friends, an older guest who prefers comfort, or a woman travelling solo who wants a guide she can trust.

As a woman working in a field that is still mostly male, safety, care and honesty are at the heart of how I work. I'll make sure you feel at home, that your questions are answered, and that you see the Rwanda I love — its wildlife, its people, its food and its stories.

I also help my guests choose and book the right place to stay, from simple guesthouses to beautiful eco-lodges, so you can relax and enjoy the adventure.`

export const DEFAULT_SETTINGS: Settings = {
  heroImage: IMAGES.hero,
  aboutImage: IMAGES.about,
  aboutBio: DEFAULT_BIO,
  instagram: 'https://www.instagram.com/ilyceintothewildbeat/',
  facebook: '',
  phone: '+250 787 618 195',
  email: 'iliceumuhoza11@gmail.com',
  address: 'Kigali, Rwanda',
  stripeLink: '',
  paypalLink: '',
  mpesaNumber: '+250 787 618 195',
  mpesaName: 'Ilyce Umuhoza',
  bankName: 'Equity Bank Rwanda',
  bankAccount: '4019113073376',
  bankAccountName: 'Ilyce Umuhoza',
  bankCurrency: 'USD',
}

export const SEED_TOURS: Tour[] = [
  {
    id: 'tour-akagera',
    slug: 'akagera-safari',
    title: 'Akagera National Park Safari',
    tagline: "Rwanda's Big Five savannah, lakes and golden sunsets",
    description:
      "Akagera is Rwanda's only savannah park — rolling hills, papyrus swamps and a chain of lakes on the Tanzanian border. We'll go on game drives in search of lions, elephants, giraffes, zebras, buffalo and, with luck, rhinos, then take a boat out on Lake Ihema to see hippos, crocodiles and hundreds of water birds.",
    price: 520,
    duration: '2 days / 1 night',
    location: 'Eastern Province',
    groupSize: '1–6 guests',
    image: IMAGES.akagera,
    highlights: [
      'Big Five game drives with an expert driver-guide',
      'Boat safari on Lake Ihema with hippos and crocodiles',
      'Giraffes, zebras and antelope on the northern plains',
      'Sunset over the savannah',
      'Comfortable 4x4 with pop-up roof for photos',
    ],
    itinerary: [
      {
        title: 'Kigali to Akagera · afternoon game drive',
        description:
          'Early pick-up from your hotel in Kigali and a scenic 2.5-hour drive east. After a picnic lunch, we head out on an afternoon game drive through the southern lakes area, then join the sunset boat trip on Lake Ihema. Overnight at a lodge inside or near the park.',
      },
      {
        title: 'Northern plains · return to Kigali',
        description:
          'Sunrise game drive to the northern plains, the best area for lions, giraffes, elephants and buffalo. Brunch at the lodge, a final drive on the way out, and back to Kigali by early evening.',
      },
    ],
    featured: true,
  },
  {
    id: 'tour-nyungwe',
    slug: 'nyungwe-forest',
    title: 'Nyungwe Forest: Canopy Walk & Chimpanzees',
    tagline: 'Ancient rainforest, chimp tracking and a walk above the treetops',
    description:
      "Nyungwe is one of Africa's oldest mountain rainforests, home to chimpanzees, 12 other primate species and more than 300 kinds of birds. Walk the famous canopy walkway 50 metres above the forest floor, track a chimpanzee family at dawn, and stop at the Kitabi tea plantations on the way.",
    price: 690,
    duration: '3 days / 2 nights',
    location: 'Southern & Western Province',
    groupSize: '1–6 guests',
    image: IMAGES.nyungwe,
    highlights: [
      'Canopy walkway suspended 50 m above the forest',
      'Early-morning chimpanzee tracking',
      'Colobus and L’Hoest’s monkeys',
      'Kitabi tea plantation and Lake Kivu views',
      'Visit to the King’s Palace Museum in Nyanza on the way',
    ],
    itinerary: [
      {
        title: 'Kigali to Nyungwe via Nyanza',
        description:
          "Drive south-west through the hills, stopping at the King's Palace Museum in Nyanza and the town of Huye. Arrive at the edge of the forest in the late afternoon and settle into your lodge.",
      },
      {
        title: 'Chimpanzee tracking & canopy walk',
        description:
          'Very early start to track chimpanzees with the park rangers. After lunch, walk the canopy walkway with incredible views over the rainforest, then relax with tea at the lodge.',
      },
      {
        title: 'Tea plantations · return to Kigali',
        description:
          'A short morning walk to look for colobus monkeys, a stop at the Kitabi tea plantations, then the scenic drive back to Kigali.',
      },
    ],
    featured: true,
  },
  {
    id: 'tour-gorilla',
    slug: 'gorilla-trekking',
    title: 'Gorilla Trekking in Volcanoes National Park',
    tagline: 'A once-in-a-lifetime hour with mountain gorillas',
    description:
      'Hike through bamboo forest on the slopes of the Virunga volcanoes to spend an unforgettable hour with a family of mountain gorillas. I will help arrange your gorilla permit, porters and walking sticks, and make sure the trek is matched to your fitness so everyone can enjoy it.',
    price: 450,
    duration: '2 days / 1 night',
    location: 'Musanze, Northern Province',
    groupSize: '1–8 guests (gorilla groups are max 8)',
    image: IMAGES.gorilla,
    highlights: [
      'One magical hour with a habituated gorilla family',
      'Help arranging your gorilla permit (permit fee separate)',
      'Treks matched to your fitness level',
      'Optional golden monkey trek or Twin Lakes visit',
      'Intore cultural dance and village visit',
    ],
    itinerary: [
      {
        title: 'Kigali to Musanze',
        description:
          'A beautiful 2-hour drive north into the volcano region. In the afternoon, choose between a visit to the Twin Lakes of Burera and Ruhondo or a cultural village experience. Overnight in Musanze.',
      },
      {
        title: 'Gorilla trek · return to Kigali',
        description:
          'Briefing at the Kinigi park headquarters at 7am, then trek with the rangers to your assigned gorilla family. After the trek, receive your certificate, enjoy lunch and return to Kigali.',
      },
    ],
    featured: true,
  },
  {
    id: 'tour-kigali',
    slug: 'kigali-city-tour',
    title: 'Kigali City Tour',
    tagline: "Africa's cleanest capital — history, art, markets and food",
    description:
      'Discover the green, hilly capital of Rwanda. We visit the Kigali Genocide Memorial to understand the country’s past, then celebrate its present at Kimironko market, local art galleries and a lunch of Rwandan dishes. A perfect first or last day of your trip.',
    price: 90,
    duration: '1 day',
    location: 'Kigali',
    groupSize: '1–6 guests',
    image: IMAGES.kigali,
    highlights: [
      'Kigali Genocide Memorial',
      'Colourful Kimironko market and fabric stalls',
      'Inema Arts Center and local craft shops',
      'Traditional Rwandan lunch',
      'Panoramic views from Mount Kigali or Rebero',
    ],
    itinerary: [
      {
        title: 'Full day in Kigali',
        description:
          'Morning pick-up and a visit to the Kigali Genocide Memorial. Then Kimironko market for fruit, fabrics and crafts, a Rwandan lunch, an afternoon at the Inema Arts Center, and sunset views over the city before drop-off at your hotel.',
      },
    ],
    featured: false,
  },
]

/** Opens the next ~75 days so the booking calendar has availability out of the box. */
export function seedSlots(): Slot[] {
  const slots: Slot[] = []
  const today = new Date()
  for (let i = 2; i < 75; i++) {
    const d = addDays(today, i)
    const dow = d.getDay()
    if (dow === 0) continue // Sundays off
    if (i % 9 === 0) continue // a few rest days
    const date = toISODate(d)
    slots.push({ id: uid(), date, time: '07:00', capacity: 6, tourId: null })
    if (dow !== 6) slots.push({ id: uid(), date, time: '13:00', capacity: 4, tourId: null })
  }
  return slots
}

export function createSeedDB(): DB {
  return {
    version: 1,
    users: [],
    tours: SEED_TOURS,
    slots: seedSlots(),
    blockedDates: [],
    bookings: [],
    reviews: [],
    photos: [],
    supportRequests: [],
    subscribers: [],
    settings: DEFAULT_SETTINGS,
  }
}
