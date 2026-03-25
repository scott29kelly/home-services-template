/**
 * Company / brand configuration.
 * Edit this file to customize business identity, contact info, and social links.
 */
export const company = {
  name: 'Acme Home Services',
  tagline: 'Roofing & Siding',
  phone: '555-123-4567',
  email: 'info@acmehomeservices.com',
  url: 'https://example.com',

  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'TX',
    zip: '78701',
    full: '123 Main St, Anytown, TX 78701',
  },

  hours: {
    weekday: 'Mon\u2013Fri: 8am\u20136pm',
    saturday: 'Sat: 9am\u20132pm',
    sunday: 'Sun: Closed',
    emergency: 'Emergency services available 24/7',
  },

  certifications: ['BBB A+', 'Licensed & Insured', 'Manufacturer Certified'],

  stats: {
    homes: { end: 500, suffix: '+', label: 'Homes Restored' },
    years: { end: 15, suffix: '+', label: 'Years Experience' },
    states: { end: 2, suffix: '', label: 'States Licensed' },
    satisfaction: { end: 100, suffix: '%', label: 'Satisfaction Guarantee' },
  },

  social: {
    facebook: '#',
    instagram: '#',
    linkedin: '#',
  },

  google: {
    placeId: '', // Google Place ID — leave empty to show placeholder reviews
    // API key is set via GOOGLE_PLACES_API_KEY env var (server-side only)
  },
}
