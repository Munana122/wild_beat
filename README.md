# Wildbeat Tours 🦁

Website for **Ilyce "Wildbeat" Umuhoza**, a certified, licensed female driver-guide in Rwanda.

Built with **React 19 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion**.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Pages

| Path | What it does |
| --- | --- |
| `/` | Hero, featured tours, About Ilyce (5+ years badge, bio), 4 highlights, reviews, "Ready for Your Adventure?" |
| `/tours`, `/tours/:slug` | All tours, and each tour's price, length, location, group size, highlights and day-by-day plan |
| `/book` | Pick tour → calendar of free dates only → time slot with spots left → request (with accommodation help) |
| `/gallery` | Starts empty. Signed-in guests upload photos (Wildlife / Landscape / Adventure), shown instantly |
| `/reviews` | Signed-in guests leave star rating + review, optionally linked to a tour |
| `/support` | Any amount; Card & wallets (Stripe), PayPal, M-Pesa, bank transfer; signed-in support requests |
| `/login` | Separate guest and admin accounts. Admin sign-up needs the secret code |
| `/admin` | Dashboard: tours, calendar, bookings, reviews, gallery, support replies, subscribers, settings |

## Admin

1. Go to **Log in / Sign up → Admin tab → Create an account**, and enter the admin secret code.
2. In **Settings**, upload Ilyce's portrait (About photo) and, if you like, a new home background photo.
3. For card / Apple Pay / Google Pay donations, create a **Stripe Payment Link** with
   "Let customers choose what to pay" and paste it into Settings. Add a PayPal.Me link the same way.
4. **Calendar**: some dates are opened for the next ~10 weeks to start with. Use "Open many dates at once",
   add/remove slots on any day, change spots, or block a day.

## ⚠️ Important: where data is stored

All data (accounts, bookings, reviews, photos…) is saved in **each visitor's own browser** (localStorage).
That's perfect for trying the site out, but on the live internet it means:

- Ilyce only sees bookings/reviews/photos made **in her own browser**, not other visitors'.
- Storage is limited (~5 MB), so only a limited number of gallery photos fit.
- The admin code check runs in the browser, so it is not real security.

**Before launching publicly, connect a real backend.** Every read and write goes through
`src/lib/store.ts` and `src/lib/auth.ts`, so swapping in **Supabase** or **Firebase**
(database + auth + image storage) only touches those files. Email notifications for new
bookings / newsletter sending also need that backend (or a service like Resend / Mailchimp).

## Deploying

Works on Netlify (`public/_redirects` included) or Vercel (`vercel.json` included).
Build command `npm run build`, output folder `dist`.

## Photos

Default photos are from Unsplash (free to use). Replace them with Ilyce's own photos via the admin dashboard
(tours → edit → photo, settings → home & about photos).
