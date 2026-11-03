export type Role = 'guest' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: Role
  createdAt: string
}

export interface ItineraryDay {
  title: string
  description: string
}

export interface Tour {
  id: string
  slug: string
  title: string
  tagline: string
  description: string
  price: number
  duration: string
  location: string
  groupSize: string
  image: string
  highlights: string[]
  itinerary: ItineraryDay[]
  featured: boolean
}

/** A bookable time slot on a date. tourId null = open for any tour. */
export interface Slot {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  capacity: number
  tourId: string | null
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  tourId: string
  slotId: string
  date: string
  time: string
  guests: number
  name: string
  email: string
  phone: string
  accommodationHelp: boolean
  accommodationNotes: string
  notes: string
  userId: string | null
  status: BookingStatus
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  name: string
  rating: number
  text: string
  tourId: string | null
  createdAt: string
}

export type PhotoCategory = 'Wildlife' | 'Landscape' | 'Adventure'
export const PHOTO_CATEGORIES: PhotoCategory[] = ['Wildlife', 'Landscape', 'Adventure']

export interface Photo {
  id: string
  userId: string
  name: string
  src: string
  category: PhotoCategory
  caption: string
  createdAt: string
}

export interface SupportRequest {
  id: string
  userId: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  reply: string | null
  repliedAt: string | null
}

export type SubscriptionTopic = 'news' | 'gallery'

export interface Subscriber {
  id: string
  email: string
  topics: SubscriptionTopic[]
  createdAt: string
}

export interface Settings {
  heroImage: string
  aboutImage: string
  aboutBio: string
  instagram: string
  facebook: string
  phone: string
  email: string
  address: string
  stripeLink: string
  paypalLink: string
  mpesaNumber: string
  mpesaName: string
  bankName: string
  bankAccount: string
  bankAccountName: string
  bankCurrency: string
}

export interface DB {
  version: number
  users: User[]
  tours: Tour[]
  slots: Slot[]
  blockedDates: string[]
  bookings: Booking[]
  reviews: Review[]
  photos: Photo[]
  supportRequests: SupportRequest[]
  subscribers: Subscriber[]
  settings: Settings
}
