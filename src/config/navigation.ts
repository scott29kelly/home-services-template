/**
 * Navigation configuration — derived from services config.
 * Header and Footer import from here so adding a service auto-updates nav.
 */
import { services } from './services'

export interface NavLink {
  href: string
  label: string
  dropdown?: { href: string; label: string }[]
}

/** Main navigation links used by the Header */
export function getNavLinks(): NavLink[] {
  return [
    { href: '/', label: 'Home' },
    {
      href: '/services',
      label: 'Services',
      dropdown: services.map((s) => ({ href: `/${s.slug}`, label: s.navLabel })),
    },
    { href: '/projects', label: 'Projects' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/about', label: 'About' },
    { href: '/service-areas', label: 'Service Areas' },
    { href: '/ava', label: 'Ask Ava' },
    { href: '/contact', label: 'Contact' },
  ]
}

/** Service links for the Footer */
export function getFooterServiceLinks(): { href: string; label: string }[] {
  const links = services.map((s) => ({ href: `/${s.slug}`, label: s.navLabel }))
  // Add sub-links like "Insurance Claims" for storm-damage
  const storm = services.find((s) => s.slug === 'storm-damage')
  if (storm) {
    links.push({ href: '/storm-damage#insurance', label: 'Insurance Claims' })
  }
  return links
}

/** Company links for the Footer */
export function getFooterCompanyLinks(): { href: string; label: string }[] {
  return [
    { href: '/about', label: 'About Us' },
    { href: '/projects', label: 'Projects' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/service-areas', label: 'Service Areas' },
    { href: '/contact', label: 'Contact' },
    { href: '/ava', label: 'Ask Ava' },
  ]
}
