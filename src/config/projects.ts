/**
 * Project gallery configuration.
 */

export type ProjectCategory = 'roofing' | 'siding' | 'storm'

export interface Project {
  id: number
  slug: string
  title: string
  location: string
  category: ProjectCategory
  detail: string
  image: string
  description?: string
  featured?: boolean
  beforeImage?: string
  afterImage?: string
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
    {
      id: 1,
      slug: 'complete-roof-replacement',
      title: 'Complete Roof Replacement',
      location: 'Anytown, TX',
      category: 'roofing' as const,
      detail: 'Architectural Shingles',
      image: '/images/project-1.webp',
      featured: true,
      description: 'This homeowner had a 22-year-old roof showing significant signs of wear — missing shingles, granule loss, and active leaks in two rooms. We completed a full tear-off and re-deck, installing GAF Timberline HDZ architectural shingles in Charcoal. The project wrapped in two days with zero call-backs.',
      beforeImage: '/images/before-after-1-before.webp',
      afterImage: '/images/before-after-1-after.webp',
    },
    {
      id: 2,
      slug: 'vinyl-siding-transformation',
      title: 'Vinyl Siding Transformation',
      location: 'Springfield, TX',
      category: 'siding' as const,
      detail: 'Vinyl Siding',
      image: '/images/project-2.webp',
      featured: true,
      description: 'Faded, warped wood siding was deteriorating and driving up energy bills for this 1980s ranch home. We removed the original wood, added a moisture barrier, and installed James Hardie fiber cement siding in Aged Pewter. The owners reported a noticeable drop in heating costs within the first month.',
      beforeImage: '/images/before-after-2-before.webp',
      afterImage: '/images/before-after-2-after.webp',
    },
    {
      id: 3,
      slug: 'hail-damage-repair',
      title: 'Hail Damage Repair',
      location: 'Riverside, TX',
      category: 'storm' as const,
      detail: 'Insurance Claim',
      image: '/images/project-3.webp',
      featured: true,
      description: 'A severe hailstorm left over 400 impact marks across this homeowner\'s roof, gutters, and siding. We handled the full insurance documentation process, meeting with the adjuster on-site to ensure a fair settlement. The complete restoration — new roof, gutters, and siding — was finished within the approved claim budget.',
    },
    {
      id: 4,
      slug: 'designer-shingle-upgrade',
      title: 'Designer Shingle Upgrade',
      location: 'Fairview, TX',
      category: 'roofing' as const,
      detail: 'Premium Shingles',
      image: '/images/project-4.webp',
      description: 'The homeowners wanted a premium aesthetic upgrade to match their newly renovated exterior. We installed CertainTeed Landmark PRO shingles in Weathered Wood, a dimensional profile that mimics hand-split cedar shake. Upgraded ridge caps and a new ventilation system were also included to extend shingle life.',
    },
    {
      id: 5,
      slug: 'siding-trim-package',
      title: 'Siding & Trim Package',
      location: 'Madison, TX',
      category: 'siding' as const,
      detail: 'Complete Exterior',
      image: '/images/project-5.webp',
      description: 'This two-story home needed more than just new siding — the original trim, fascia, and soffit were all rotted and pulling away from the structure. We replaced the full exterior package with LP SmartSide engineered wood siding, new PVC trim boards, and seamless aluminum fascia, fully refreshing the home\'s curb appeal.',
    },
    {
      id: 6,
      slug: 'wind-damage-restoration',
      title: 'Wind Damage Restoration',
      location: 'Georgetown, TX',
      category: 'storm' as const,
      detail: 'Emergency Repair',
      image: '/images/project-6.webp',
      featured: true,
      description: 'Straight-line winds from a derecho peeled back nearly a quarter of this home\'s roof in under 30 minutes. Our crew was on-site within four hours, installing emergency tarping to prevent further interior damage. A full roof replacement was completed the following week, and the homeowners were back in their beds within 10 days.',
    },
    {
      id: 7,
      slug: 'multi-family-roofing',
      title: 'Multi-Family Roofing',
      location: 'Lakewood, TX',
      category: 'roofing' as const,
      detail: 'Commercial Grade',
      image: '/images/project-7.webp',
      description: 'Managing a 24-unit apartment complex roof replacement requires careful coordination to keep disruption minimal for residents. We staged the project in three phases over six weeks, completing each building\'s roof while residents continued their daily routines. Commercial-grade TPO membrane on the flat sections and architectural shingles on pitched areas ensure 25-year durability.',
    },
    {
      id: 8,
      slug: 'historic-home-restoration',
      title: 'Historic Home Restoration',
      location: 'Cedar Park, TX',
      category: 'siding' as const,
      detail: 'Custom Match',
      image: '/images/project-8.webp',
      description: 'Restoring an 1890s Queen Anne Victorian requires matching original profiles that haven\'t been in production for decades. We sourced custom-milled cedar lap siding and decorative fish-scale shingles to replicate the original patterns exactly. The project received recognition from the local historic preservation commission for its accuracy and craftsmanship.',
    },
    {
      id: 9,
      slug: 'estate-roof-replacement',
      title: 'Estate Roof Replacement',
      location: 'Tulsa, OK',
      category: 'roofing' as const,
      detail: 'Premium Materials',
      image: '/images/project-9.webp',
      description: 'A 5,800 sq ft estate home with multiple roof planes, skylights, and a slate tile section required a crew with specialized expertise. We replaced the asphalt field with Owens Corning Duration FLEX shingles, re-flashed all four skylights, and restored the slate section with hand-matched Vermont slate. The project was completed on schedule with a 10-year workmanship warranty.',
    },
    {
      id: 10,
      slug: 'emergency-tree-damage-repair',
      title: 'Emergency Tree Damage Repair',
      location: 'Norman, OK',
      category: 'storm' as const,
      detail: 'Storm Response',
      image: '/images/project-10.webp',
      description: 'A 70-foot oak fell directly onto the master bedroom during a nighttime thunderstorm, puncturing the roof and causing structural damage to the top plate. We coordinated with a tree service for safe removal, then rebuilt the damaged rafter system and completed a full roof replacement within five days so the family could return home.',
    },
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

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.items.find(p => p.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.items.filter(p => p.featured)
}
