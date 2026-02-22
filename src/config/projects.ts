/**
 * Project gallery configuration.
 */

export type ProjectCategory = 'roofing' | 'siding' | 'storm'

export interface Project {
  id: number
  title: string
  location: string
  category: ProjectCategory
  detail: string
  image: string
}

export interface BeforeAfter {
  title: string
  location: string
  description: string
  before: string
  after: string
}

export const projects = {
  items: [
    { id: 1, title: 'Complete Roof Replacement', location: 'Anytown, TX', category: 'roofing' as const, detail: 'Architectural Shingles', image: '/images/project-1.webp' },
    { id: 2, title: 'Vinyl Siding Transformation', location: 'Springfield, TX', category: 'siding' as const, detail: 'Vinyl Siding', image: '/images/project-2.webp' },
    { id: 3, title: 'Hail Damage Repair', location: 'Riverside, TX', category: 'storm' as const, detail: 'Insurance Claim', image: '/images/project-3.webp' },
    { id: 4, title: 'Designer Shingle Upgrade', location: 'Fairview, TX', category: 'roofing' as const, detail: 'Premium Shingles', image: '/images/project-4.webp' },
    { id: 5, title: 'Siding & Trim Package', location: 'Madison, TX', category: 'siding' as const, detail: 'Complete Exterior', image: '/images/project-5.webp' },
    { id: 6, title: 'Wind Damage Restoration', location: 'Georgetown, TX', category: 'storm' as const, detail: 'Emergency Repair', image: '/images/project-6.webp' },
    { id: 7, title: 'Multi-Family Roofing', location: 'Lakewood, TX', category: 'roofing' as const, detail: 'Commercial Grade', image: '/images/project-7.webp' },
    { id: 8, title: 'Historic Home Restoration', location: 'Cedar Park, TX', category: 'siding' as const, detail: 'Custom Match', image: '/images/project-8.webp' },
    { id: 9, title: 'Estate Roof Replacement', location: 'Tulsa, OK', category: 'roofing' as const, detail: 'Premium Materials', image: '/images/project-9.webp' },
    { id: 10, title: 'Emergency Tree Damage Repair', location: 'Norman, OK', category: 'storm' as const, detail: 'Storm Response', image: '/images/project-10.webp' },
  ] satisfies Project[],

  beforeAfter: [
    {
      title: 'Roof Replacement After Hail Damage',
      location: 'Anytown, TX',
      description: 'Insurance covered cost minus deductible.',
      before: '/images/before-after-1-before.webp',
      after: '/images/before-after-1-after.webp',
    },
    {
      title: 'Full Vinyl Siding Replacement',
      location: 'Springfield, TX',
      description: 'Improved curb appeal and energy efficiency.',
      before: '/images/before-after-2-before.webp',
      after: '/images/before-after-2-after.webp',
    },
  ] satisfies BeforeAfter[],

  filters: [
    { value: 'all' as const, label: 'All Projects' },
    { value: 'roofing' as const, label: 'Roofing' },
    { value: 'siding' as const, label: 'Siding' },
    { value: 'storm' as const, label: 'Storm Damage' },
  ],
}
