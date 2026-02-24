import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" description="The page you're looking for doesn't exist." path="/404" noindex />
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-surface rounded-2xl flex items-center justify-center">
            <Home className="w-10 h-10 text-navy/40" />
          </div>
          <h1 className="text-6xl font-extrabold text-navy mb-2">404</h1>
          <p className="text-xl font-semibold text-navy mb-2">Page Not Found</p>
          <p className="text-text-secondary mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface text-navy font-semibold rounded-full hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
