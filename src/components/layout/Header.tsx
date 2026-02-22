import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'
import { company } from '../../config/company'
import { serviceAreas } from '../../config/service-areas'
import { getNavLinks } from '../../config/navigation'

const navLinks = getNavLinks()

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Close mobile menu on route change
  useEffect(() => {
    closeMobile()
  }, [location.pathname, closeMobile])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobile()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mobileOpen, closeMobile])

  return (
    <>
      {/* Top Bar */}
      <div className="bg-navy text-white text-sm h-8 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center w-full">
          <span className="hidden sm:inline text-white/60">{serviceAreas.summary}</span>
          <div className="flex items-center gap-4 text-white/60 ml-auto">
            <a href={`tel:${company.phone}`} className="hover:text-white transition-colors">
              {company.phone}
            </a>
            <a
              href={`mailto:${company.email}`}
              className="hidden md:inline hover:text-white transition-colors"
            >
              {company.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-6 h-6" aria-hidden="true">
                <path fill="#F97316" d="M50 20L25 42v38h50V42L50 20z" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-navy font-heading font-extrabold text-lg tracking-tight">
                {company.name}
              </span>
              <span className="text-navy/70 text-xs font-medium -mt-0.5">{company.tagline}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.href}
                  className="relative group"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    to={link.href}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'text-brand-blue'
                        : 'text-navy/70 hover:text-navy hover:bg-surface'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Link>
                  <div
                    className={`absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-border py-2 transition-all duration-200 ${
                      dropdownOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {link.dropdown.map((sub) => (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className="block px-4 py-2 text-sm text-navy/70 hover:text-navy hover:bg-surface transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-brand-blue'
                      : 'text-navy/70 hover:text-navy hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-safety-orange to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
            >
              Get Estimate
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile backdrop — behind the nav panel, click to close */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Mobile Nav — fixed below the sticky header (h-16 = 4rem) */}
      <div
        className={`lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-white overflow-y-auto transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-label="Navigation menu"
      >
        <nav className="p-6 space-y-1">
          {navLinks.map((link) => (
            <div key={link.href}>
              <Link
                to={link.href}
                onClick={closeMobile}
                className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-blue bg-brand-blue/5'
                    : 'text-navy hover:bg-surface'
                }`}
              >
                {link.label}
              </Link>
              {link.dropdown?.map((sub) => (
                <Link
                  key={sub.href}
                  to={sub.href}
                  onClick={closeMobile}
                  className="block pl-10 pr-4 py-2.5 text-sm text-navy/60 hover:text-navy hover:bg-surface rounded-lg transition-colors"
                >
                  {sub.label}
                </Link>
              ))}
            </div>
          ))}
          <div className="pt-4">
            <Link
              to="/contact"
              onClick={closeMobile}
              className="block w-full text-center px-5 py-3 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full"
            >
              Get Free Estimate
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
