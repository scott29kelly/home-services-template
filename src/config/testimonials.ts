/**
 * Testimonial configuration.
 * `featured` is derived from `all` so the homepage carousel stays in sync with
 * the long-form review data used elsewhere in the site.
 */
import { company } from './company'

export interface Testimonial {
  name: string
  location: string
  quote: string
  image: string
  service?: string
  /** 1-5 star rating; defaults to 5 when used in AggregateRating */
  rating?: number
  /** Explicitly marked for homepage carousel */
  featured?: boolean
  /** City slug for filtering: show on /service-areas/{slug} */
  citySlug?: string
  /** Service slug for filtering: show on /{service-slug} */
  serviceSlug?: string
  /** Public-facing source label for trust surfaces */
  source?: string
  /** Public-facing date label, for example "January 2026" */
  reviewDate?: string
  /** Optional related project detail page */
  projectSlug?: string
  /** Short proof chips shown beside the quote */
  highlights?: string[]
}

const allTestimonials: Testimonial[] = [
  {
    name: 'Michael R.',
    location: 'Anytown, TX',
    service: 'Roofing',
    quote:
      "They made our roof replacement seamless. After a bad hail storm, the team found damage we couldn't see from the ground, handled the claim paperwork, and installed the new system in two days. The crew left the property spotless and the warranty packet was in our inbox before dinner.",
    image: '/images/testimonial-1.webp',
    rating: 5,
    featured: true,
    citySlug: 'anytown',
    serviceSlug: 'roofing',
    source: 'Post-project survey',
    reviewDate: 'January 2026',
    projectSlug: 'complete-roof-replacement',
    highlights: ['Insurance claim handled', '2-day replacement', 'GAF Timberline HDZ'],
  },
  {
    name: 'Jennifer T.',
    location: 'Springfield, TX',
    service: 'Storm Repair',
    quote:
      "After the storm, I didn't know where to start with my insurance claim. They walked me through every step, met the adjuster on site, and sent a photo report the same day. We barely paid anything out of pocket and the new roof was finished before the next round of rain.",
    image: '/images/testimonial-2.webp',
    rating: 5,
    featured: true,
    citySlug: 'springfield',
    serviceSlug: 'storm-damage',
    source: 'Google review',
    reviewDate: 'February 2026',
    highlights: ['Adjuster meeting support', 'Same-day photo report', 'Minimal out-of-pocket cost'],
  },
  {
    name: 'David & Susan K.',
    location: 'Riverside, TX',
    service: 'Siding',
    quote:
      "Professional, honest, and they stand behind their work. The new siding transformed our 1980s home and the trim details finally look finished instead of patched together. We appreciated the daily updates and the fact that every punch-list item was closed out before final payment.",
    image: '/images/testimonial-3.webp',
    rating: 5,
    featured: true,
    citySlug: 'riverside',
    serviceSlug: 'siding',
    source: 'Warranty follow-up',
    reviewDate: 'November 2025',
    highlights: ['Trim and soffit refreshed', 'Daily progress updates', 'Punch list closed same week'],
  },
  {
    name: 'Robert H.',
    location: 'Fairview, TX',
    service: 'Insurance',
    quote:
      "I had three other companies come out after the storm. Two said I didn't have enough damage to claim. This team documented everything, showed us the collateral damage on the vents and gutters, and helped us secure approval for a full roof replacement. They were calm, honest, and incredibly prepared.",
    image: '/images/testimonial-4.webp',
    rating: 5,
    featured: true,
    citySlug: 'fairview',
    serviceSlug: 'storm-damage',
    source: 'Insurance restoration survey',
    reviewDate: 'October 2025',
    highlights: ['Collateral damage documented', 'Full replacement approved', 'Adjuster-ready scope'],
  },
  {
    name: 'Paul S.',
    location: 'Lakewood, TX',
    service: 'Multi-Property',
    quote:
      "As a property manager, I've worked with a lot of contractors. This is one of the few companies I trust completely. They've handled roofs on multiple properties for us and every job has been clean, documented, and easy to turn over to ownership for approval. Communication has been excellent every time.",
    image: '/images/testimonial-5.webp',
    rating: 4,
    citySlug: 'lakewood',
    source: 'Property manager follow-up',
    reviewDate: 'September 2025',
    highlights: ['Multi-property coordination', 'Owner-ready documentation', 'Clean turnovers'],
  },
  {
    name: 'Lisa M.',
    location: 'Georgetown, TX',
    service: 'Storm Repair',
    quote:
      "We were nervous about the insurance claim process, but they made it easy. They tarped the roof the same afternoon, met with our adjuster, and turned around the full replacement the next week. The finished roof looks great and we have written workmanship coverage in hand.",
    image: '/images/testimonial-6.webp',
    rating: 5,
    featured: true,
    citySlug: 'georgetown',
    serviceSlug: 'storm-damage',
    source: 'Google review',
    reviewDate: 'March 2026',
    projectSlug: 'wind-damage-restoration',
    highlights: ['Emergency tarping same day', 'Next-week replacement', 'Written workmanship coverage'],
  },
  {
    name: 'Tom C.',
    location: 'Cedar Park, TX',
    service: 'Roofing',
    quote:
      "Great family-owned company with real integrity. The owner personally checked the flashing details before close-out, and when I had a question about attic ventilation they sent photos and explained exactly what had changed. That's the kind of follow-through you rarely see anymore.",
    image: '/images/testimonial-7.webp',
    rating: 4,
    citySlug: 'cedar-park',
    serviceSlug: 'roofing',
    source: 'Post-install walkthrough',
    reviewDate: 'December 2025',
    highlights: ['Owner QC inspection', 'Ventilation photos shared', 'Responsive follow-through'],
  },
  {
    name: 'Angela M.',
    location: 'Madison, TX',
    service: 'Siding',
    quote:
      "From start to finish, they exceeded our expectations. The team brought samples, helped us work through the trim package, and gave us a realistic schedule before work started. Our home looks incredible and we've already sent three neighbors to them for quotes.",
    image: '/images/testimonial-8.webp',
    rating: 5,
    citySlug: 'madison',
    serviceSlug: 'siding',
    source: 'Customer referral follow-up',
    reviewDate: 'August 2025',
    projectSlug: 'siding-trim-package',
    highlights: ['Sample kit provided', 'Trim package guidance', 'Neighbor referrals generated'],
  },
]

export const testimonials = {
  featured: allTestimonials.filter((testimonial) => testimonial.featured),
  all: allTestimonials,
  ratingBadges: [
    {
      icon: 'Star',
      label: `${company.proof.averageRating.toFixed(1)} average rating`,
      sublabel: `${company.proof.reviewCount}+ homeowner reviews`,
    },
    {
      icon: 'Shield',
      label: company.proof.workmanshipWarranty,
      sublabel: 'Written labor coverage on completed installs',
    },
    {
      icon: 'Award',
      label: `${company.proof.manufacturerPartners.length} certified brands`,
      sublabel: company.proof.manufacturerPartners.join(', '),
    },
    {
      icon: 'Medal',
      label: 'Insurance claim support',
      sublabel: 'Photo reports, supplements, and adjuster meetings',
    },
  ],
}

/** Filter testimonials by city slug */
export function getTestimonialsByCity(slug: string): Testimonial[] {
  return testimonials.all.filter((testimonial) => testimonial.citySlug === slug)
}
