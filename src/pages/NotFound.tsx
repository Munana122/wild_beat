import { Link } from '../lib/router'

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="eyebrow">Off the beaten track</p>
      <h1 className="section-title mt-3">This trail doesn't lead anywhere</h1>
      <p className="mt-4 text-earth-light">The page you're looking for couldn't be found.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </section>
  )
}
