import { Link } from 'react-router-dom'
import { Phone, MapPin, Mail } from 'lucide-react'
import { company } from '../../config/company'
import { getFooterServiceLinks, getFooterCompanyLinks } from '../../config/navigation'

const serviceLinks = getFooterServiceLinks()
const companyLinks = getFooterCompanyLinks()

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-6 h-6">
                  <path fill="#F97316" d="M50 20L25 42v38h50V42L50 20z" />
                </svg>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-heading font-extrabold text-lg">{company.name}</span>
                <span className="text-white/60 text-xs font-medium -mt-0.5">{company.tagline}</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              {company.name} is a trusted home services company built on integrity
              and a commitment to protecting your home. We treat every
              customer like family.
            </p>
            <div className="flex flex-wrap gap-2">
              {company.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1 bg-white/10 rounded-md text-xs text-white/80"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">
              Services
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-white/90">
              Contact
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {company.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {company.address.street}
                  <br />
                  {company.address.city}, {company.address.state} {company.address.zip}
                </span>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a href={company.social.facebook} aria-label="Facebook" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href={company.social.instagram} aria-label="Instagram" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href={company.social.linkedin} aria-label="LinkedIn" className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
