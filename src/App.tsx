import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, matchPath } from './lib/router'
import { Toaster } from './lib/toast'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import Book from './pages/Book'
import Gallery from './pages/Gallery'
import Reviews from './pages/Reviews'
import Support from './pages/Support'
import Login from './pages/Login'
import Admin from './pages/admin/Admin'
import NotFound from './pages/NotFound'

function route(pathname: string) {
  if (pathname === '/') return <Home />
  if (pathname === '/tours') return <Tours />
  const t = matchPath('/tours/:slug', pathname)
  if (t) return <TourDetail slug={t.slug} />
  if (pathname === '/book') return <Book />
  if (pathname === '/gallery') return <Gallery />
  if (pathname === '/reviews') return <Reviews />
  if (pathname === '/support') return <Support />
  if (pathname === '/login') return <Login />
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return <Admin />
  return <NotFound />
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {route(pathname)}
        </motion.main>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      <Toaster />
    </div>
  )
}
