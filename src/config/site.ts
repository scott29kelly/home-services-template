/**
 * Central site configuration — edit this file to customize the template.
 * All components import from here so you only need to update one place.
 */

export const SITE = {
  /** Company / brand name */
  name: 'Acme Home Services',
  /** Short tagline shown below the logo */
  tagline: 'Roofing & Siding',
  /** Primary phone number (displayed + href) */
  phone: '555-123-4567',
  /** Contact email */
  email: 'info@acmehomeservices.com',
  /** Base URL for OG tags / canonical links */
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

  serviceArea: {
    /** Shown in the top bar */
    summary: 'Serving the Greater Metro Area',
    /** States / regions listed on the Service Areas page */
    states: [
      {
        name: 'Texas',
        badge: 'HQ' as const,
        areas: [
          'Anytown (HQ)', 'Springfield', 'Riverside', 'Fairview',
          'Madison', 'Georgetown', 'Lakewood', 'Cedar Park',
        ],
      },
      {
        name: 'Oklahoma',
        badge: undefined as string | undefined,
        areas: [
          'Tulsa', 'Norman', 'Edmond', 'Broken Arrow',
          'Lawton', 'Moore', 'Stillwater', 'Midwest City',
        ],
      },
    ],
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

  assistant: {
    name: 'Ava',
    fullName: 'Ava — AI Virtual Assistant',
    role: 'Virtual Assistant',
    greeting:
      "Hi! I'm Ava, your virtual assistant. How can I help you today?",
    pageGreeting:
      "Hi there! I'm Ava, your AI virtual assistant. I'm here to help you understand the storm damage insurance claims process, schedule inspections, or answer any questions about our services. How can I help you today?",
    avatarSmall: '/images/avatar-ava.webp',
    avatarLarge: '/images/avatar-ava-large.webp',
    quickActions: [
      'I have storm damage',
      'How do insurance claims work?',
      'Schedule an inspection',
      'What will I pay?',
    ],
    pageQuickActions: [
      'I have storm damage on my roof',
      'How does the insurance claims process work?',
      'What will I have to pay out of pocket?',
      'Schedule a free inspection',
      'What areas do you serve?',
      'Tell me about your company',
    ],
  },
} as const

export type SiteConfig = typeof SITE
