/**
 * Zod validation schemas for all config modules.
 * Validated at startup via index.ts — invalid config shows clear error messages.
 */
import { z } from 'zod'

/* ── Company ──────────────────────────────────────────────────────── */

export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  full: z.string().min(1),
})

export const hoursSchema = z.object({
  weekday: z.string().min(1),
  saturday: z.string().min(1),
  sunday: z.string().min(1),
  emergency: z.string().min(1),
})

export const statSchema = z.object({
  end: z.number().min(0),
  suffix: z.string(),
  label: z.string().min(1),
})

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  url: z.string().url('Invalid URL'),
  address: addressSchema,
  hours: hoursSchema,
  certifications: z.array(z.string()).min(1, 'At least one certification is required'),
  stats: z.object({
    homes: statSchema,
    years: statSchema,
    states: statSchema,
    satisfaction: statSchema,
  }),
  social: z.object({
    facebook: z.string(),
    instagram: z.string(),
    linkedin: z.string(),
  }),
})

/* ── Service Areas ────────────────────────────────────────────────── */

export const serviceAreaStateSchema = z.object({
  name: z.string().min(1),
  badge: z.string().optional(),
  areas: z.array(z.string()).min(1),
})

export const serviceAreasSchema = z.object({
  summary: z.string().min(1),
  states: z.array(serviceAreaStateSchema).min(1, 'At least one state is required'),
})

/* ── Services ─────────────────────────────────────────────────────── */

const cardGridSectionSchema = z.object({
  type: z.literal('cardGrid'),
  bg: z.enum(['white', 'surface']).optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3)]).optional(),
  cards: z.array(z.object({
    title: z.string().min(1),
    image: z.string().min(1),
    description: z.string().min(1),
    features: z.array(z.string()),
  })).min(1),
})

const iconGridSectionSchema = z.object({
  type: z.literal('iconGrid'),
  bg: z.enum(['white', 'surface']).optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
  colorScheme: z.enum(['blue', 'orange']).optional(),
  cards: z.array(z.object({
    icon: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  })).min(1),
})

const materialGridSectionSchema = z.object({
  type: z.literal('materialGrid'),
  bg: z.enum(['white', 'surface']).optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  cards: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    items: z.array(z.string()),
  })).min(1),
})

const styleGallerySectionSchema = z.object({
  type: z.literal('styleGallery'),
  bg: z.enum(['white', 'surface']).optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  cards: z.array(z.object({
    title: z.string().min(1),
    image: z.string().min(1),
    description: z.string().min(1),
  })).min(1),
})

const certBarSectionSchema = z.object({
  type: z.literal('certBar'),
  items: z.array(z.string()).min(1),
})

const emergencyBannerSectionSchema = z.object({
  type: z.literal('emergencyBanner'),
  text: z.string().min(1),
  ctaText: z.string().min(1),
  ctaHref: z.string().min(1),
})

const processTimelineSectionSchema = z.object({
  type: z.literal('processTimeline'),
})

const trustSectionSchema = z.object({
  type: z.literal('trustSection'),
  bg: z.enum(['white', 'surface']).optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  trustPoints: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).min(1),
  ctaText: z.string().min(1),
  ctaHref: z.string().min(1),
  sidebar: z.object({
    title: z.string().min(1),
    icon: z.string().min(1),
    items: z.array(z.string()).min(1),
    footnote: z.string().optional(),
  }),
})

const serviceSectionSchema = z.discriminatedUnion('type', [
  cardGridSectionSchema,
  iconGridSectionSchema,
  materialGridSectionSchema,
  styleGallerySectionSchema,
  certBarSectionSchema,
  emergencyBannerSectionSchema,
  processTimelineSectionSchema,
  trustSectionSchema,
])

export const serviceConfigSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  name: z.string().min(1),
  navLabel: z.string().min(1),
  icon: z.string().min(1),
  hero: z.object({
    backgroundImage: z.string().min(1),
    headline: z.string().min(1),
    highlightText: z.string().min(1),
    subhead: z.string().min(1),
    primaryCTA: z.object({ text: z.string(), href: z.string() }).optional(),
    showEmergencyPhone: z.boolean().optional(),
  }),
  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  overview: z.object({
    image: z.string().min(1),
    description: z.string().min(1),
  }),
  sections: z.array(serviceSectionSchema),
  faqs: z.object({
    title: z.string().min(1),
    items: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })),
  }),
})

export const servicesSchema = z.array(serviceConfigSchema).min(1, 'At least one service is required')

/* ── Testimonials ─────────────────────────────────────────────────── */

const testimonialSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  quote: z.string().min(1),
  image: z.string().min(1),
  service: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  citySlug: z.string().optional(),
  serviceSlug: z.string().optional(),
})

export const testimonialsSchema = z.object({
  featured: z.array(testimonialSchema).min(1),
  all: z.array(testimonialSchema).min(1),
  ratingBadges: z.array(z.object({
    icon: z.string().min(1),
    label: z.string().min(1),
    sublabel: z.string().min(1),
  })),
})

/* ── Projects ─────────────────────────────────────────────────────── */

export const projectSchema = z.object({
  id: z.number(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  title: z.string().min(1),
  location: z.string().min(1),
  category: z.enum(['roofing', 'siding', 'storm']),
  detail: z.string().min(1),
  image: z.string().min(1),
  description: z.string().optional(),
  featured: z.boolean().optional(),
  beforeImage: z.string().optional(),
  afterImage: z.string().optional(),
})

export const projectsSchema = z.object({
  items: z.array(projectSchema).min(1),
  beforeAfter: z.array(z.object({
    title: z.string().min(1),
    location: z.string().min(1),
    description: z.string().min(1),
    before: z.string().min(1),
    after: z.string().min(1),
  })),
  filters: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })),
})

/* ── Team ─────────────────────────────────────────────────────────── */

export const teamSchema = z.object({
  members: z.array(z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    image: z.string().min(1),
  })).min(1),
  values: z.array(z.object({
    icon: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
  })),
  certifications: z.array(z.string()),
})

/* ── Assistant ────────────────────────────────────────────────────── */

export const assistantSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().min(1),
  role: z.string().min(1),
  greeting: z.string().min(1),
  pageGreeting: z.string().min(1),
  avatarSmall: z.string().min(1),
  avatarLarge: z.string().min(1),
  quickActions: z.array(z.string()).min(1),
  pageQuickActions: z.array(z.string()).min(1),
})
