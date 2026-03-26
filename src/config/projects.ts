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
  system?: string
  timeline?: string
  warranty?: string
  scope?: string[]
  outcomes?: string[]
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
      detail: 'Architectural shingles',
      image: '/images/project-1.webp',
      featured: true,
      description:
        'This homeowner had a 22-year-old roof showing significant wear, active leaks in two rooms, and soft decking around the valleys. We completed a full tear-off and re-deck, then installed a premium architectural shingle system designed for storm resilience and cleaner attic ventilation.',
      beforeImage: '/images/before-after-1-before.webp',
      afterImage: '/images/before-after-1-after.webp',
      system: 'GAF Timberline HDZ architectural shingles in Charcoal',
      timeline: '2-day installation',
      warranty: '50-year material coverage with 10-year workmanship warranty',
      scope: [
        'Full tear-off of the existing 22-year-old shingle roof',
        'Deck inspection with replacement of damaged sheathing',
        'Synthetic underlayment, new ridge ventilation, and updated flashing',
      ],
      outcomes: [
        'Stopped active leaks before the next storm cycle',
        'Claim documentation packaged for the insurance file',
        'Completed with same-day cleanup and magnetic nail sweep',
      ],
    },
    {
      id: 2,
      slug: 'vinyl-siding-transformation',
      title: 'Vinyl Siding Transformation',
      location: 'Springfield, TX',
      category: 'siding' as const,
      detail: 'Fiber cement siding',
      image: '/images/project-2.webp',
      featured: true,
      description:
        'Faded, warped wood siding was deteriorating and driving up energy bills for this 1980s ranch home. We removed the failing cladding, corrected the weather barrier, and rebuilt the exterior package with a more durable low-maintenance system.',
      beforeImage: '/images/before-after-2-before.webp',
      afterImage: '/images/before-after-2-after.webp',
      system: 'James Hardie fiber cement siding in Aged Pewter',
      timeline: '4-day exterior renovation',
      warranty: '30-year non-prorated siding warranty plus workmanship coverage',
      scope: [
        'Remove failing wood siding and repair moisture-damaged sheathing',
        'Install new weather barrier, trim package, and fiber cement cladding',
        'Finish with matched corners, soffits, and low-maintenance caulk lines',
      ],
      outcomes: [
        'Noticeable drop in heating costs reported after install',
        'Boosted curb appeal for an upcoming refinance appraisal',
        'Delivered a cleaner, HOA-ready exterior package',
      ],
    },
    {
      id: 3,
      slug: 'hail-damage-repair',
      title: 'Hail Damage Repair',
      location: 'Riverside, TX',
      category: 'storm' as const,
      detail: 'Insurance restoration',
      image: '/images/project-3.webp',
      featured: true,
      description:
        'A severe hailstorm left more than 400 impact marks across this home\'s roof, gutters, and siding. We handled the full documentation process, met with the adjuster on site, and coordinated a complete restoration within the approved claim scope.',
      system: 'Full roof, gutter, and siding restoration funded through insurance',
      timeline: 'Claim approved in 12 days and build completed in 3 days',
      warranty: 'Manufacturer system warranties plus documented claim close-out',
      scope: [
        'Photograph and map hail impacts across the roof and accessory metals',
        'Meet with the insurance adjuster to review scope line by line',
        'Replace roofing, gutters, and damaged siding inside the approved budget',
      ],
      outcomes: [
        '400+ hail impacts documented for claim support',
        'No supplement dispute at final payment',
        'Home restored before interior water damage spread',
      ],
    },
    {
      id: 4,
      slug: 'designer-shingle-upgrade',
      title: 'Designer Shingle Upgrade',
      location: 'Fairview, TX',
      category: 'roofing' as const,
      detail: 'Premium designer shingles',
      image: '/images/project-4.webp',
      description:
        'The homeowners wanted a premium aesthetic upgrade to match their newly renovated exterior. We installed a dimensional designer shingle profile, upgraded the ventilation system, and rebuilt the ridge details to improve both appearance and long-term performance.',
      system: 'CertainTeed Landmark PRO in Weathered Wood',
      timeline: '3-day replacement',
      warranty: 'Enhanced manufacturer warranty with upgraded ridge accessories',
      scope: [
        'Remove worn roofing and inspect decking around roof penetrations',
        'Install upgraded ridge caps, starter strip, and intake ventilation',
        'Coordinate color approval with the homeowner before material delivery',
      ],
      outcomes: [
        'Delivered a higher-end curb-appeal upgrade without changing the roofline',
        'Improved attic airflow to help extend shingle life',
        'Finished on schedule ahead of exterior painting work',
      ],
    },
    {
      id: 5,
      slug: 'siding-trim-package',
      title: 'Siding & Trim Package',
      location: 'Madison, TX',
      category: 'siding' as const,
      detail: 'Complete exterior refresh',
      image: '/images/project-5.webp',
      description:
        'This two-story home needed more than new siding. The trim, fascia, and soffit were all deteriorating, which meant the exterior package had to be rebuilt together if the owners wanted a clean and durable result.',
      system: 'LP SmartSide siding with PVC trim and seamless aluminum fascia',
      timeline: '5-day install',
      warranty: 'Manufacturer siding warranty plus 10-year workmanship coverage',
      scope: [
        'Replace the full siding field plus damaged fascia and soffit runs',
        'Install PVC trim boards at windows, corners, and roof intersections',
        'Rebuild problem areas where previous moisture had softened the substrate',
      ],
      outcomes: [
        'Eliminated recurring trim rot at the gable returns',
        'Created a uniform finish ready for long-term low-maintenance upkeep',
        'Generated multiple neighbor referrals within the same month',
      ],
    },
    {
      id: 6,
      slug: 'wind-damage-restoration',
      title: 'Wind Damage Restoration',
      location: 'Georgetown, TX',
      category: 'storm' as const,
      detail: 'Emergency repair',
      image: '/images/project-6.webp',
      featured: true,
      description:
        'Straight-line winds from a derecho peeled back nearly a quarter of this home\'s roof in under 30 minutes. Our crew was on site within hours to secure the structure, prevent interior damage, and build the replacement plan around the approved claim.',
      system: 'Storm-rated shingle replacement with upgraded flashing package',
      timeline: 'Emergency dry-in in 4 hours, permanent repair in 7 days',
      warranty: 'New system warranty with documented emergency response file',
      scope: [
        'Emergency tarp and temporary weatherproofing the same afternoon',
        'Rebuild damaged decking and replace compromised flashing lines',
        'Install the final roof system after claim approval the following week',
      ],
      outcomes: [
        'Prevented further interior damage after the initial wind event',
        'Got the homeowners back into their bedroom within 10 days',
        'Closed the claim with full photo documentation and final invoice support',
      ],
    },
    {
      id: 7,
      slug: 'multi-family-roofing',
      title: 'Multi-Family Roofing',
      location: 'Lakewood, TX',
      category: 'roofing' as const,
      detail: 'Commercial-grade roofing',
      image: '/images/project-7.webp',
      description:
        'Managing a 24-unit apartment complex roof replacement required staging, tenant communication, and careful sequencing to keep disruption minimal. The ownership group needed documentation they could share with lenders and residents throughout the project.',
      system: 'TPO membrane on flat sections with architectural shingles on pitched roofs',
      timeline: '6-week phased installation',
      warranty: '25-year commercial membrane coverage with phased QA sign-offs',
      scope: [
        'Stage the project building by building to keep residents in place',
        'Replace flat and pitched roof sections with matching drainage details',
        'Provide weekly progress reporting for ownership and property management',
      ],
      outcomes: [
        'Maintained resident access during every phase',
        'Delivered lender-ready documentation and photo logs',
        'Extended the service life of both flat and pitched roof assemblies',
      ],
    },
    {
      id: 8,
      slug: 'historic-home-restoration',
      title: 'Historic Home Restoration',
      location: 'Cedar Park, TX',
      category: 'siding' as const,
      detail: 'Custom exterior match',
      image: '/images/project-8.webp',
      description:
        'Restoring an 1890s Queen Anne Victorian required matching original profiles that have not been in regular production for decades. The project was as much about preservation and detailing as it was about weatherproofing.',
      system: 'Custom-milled cedar lap siding with decorative fish-scale shingles',
      timeline: '3-week preservation install',
      warranty: 'Preservation-grade finish system with documented maintenance guidance',
      scope: [
        'Source custom-milled siding profiles to match the original facade',
        'Rebuild damaged trim transitions before installing the finished cladding',
        'Coordinate details with the local preservation review process',
      ],
      outcomes: [
        'Matched historic profiles without flattening the original character',
        'Earned recognition from the local preservation commission',
        'Provided the homeowner with a maintenance plan for future repainting',
      ],
    },
    {
      id: 9,
      slug: 'estate-roof-replacement',
      title: 'Estate Roof Replacement',
      location: 'Tulsa, OK',
      category: 'roofing' as const,
      detail: 'Premium material package',
      image: '/images/project-9.webp',
      description:
        'A 5,800 sq ft estate home with multiple roof planes, skylights, and a slate tile section required a crew with premium residential experience. The owners wanted a system that could handle hail season without compromising the architectural look of the property.',
      system: 'Owens Corning Duration FLEX shingles with restored Vermont slate accents',
      timeline: '8-day premium install',
      warranty: '10-year workmanship warranty with premium material registration',
      scope: [
        'Replace the asphalt field, reflash skylights, and preserve the slate section',
        'Coordinate material staging around landscaping and estate access points',
        'Document specialty details for the homeowner and insurance file',
      ],
      outcomes: [
        'Upgraded the roof to a more hail-resistant premium system',
        'Maintained the original slate visual where the owners wanted authenticity',
        'Completed on schedule with no landscaping damage',
      ],
    },
    {
      id: 10,
      slug: 'emergency-tree-damage-repair',
      title: 'Emergency Tree Damage Repair',
      location: 'Norman, OK',
      category: 'storm' as const,
      detail: 'Storm response',
      image: '/images/project-10.webp',
      description:
        'A 70-foot oak fell directly onto the master bedroom during a nighttime thunderstorm, puncturing the roof and damaging the rafter system. The family needed immediate stabilization and a contractor who could coordinate multiple trades quickly.',
      system: 'Structural roof rebuild with full shingle replacement',
      timeline: 'Emergency stabilization overnight, full rebuild in 5 days',
      warranty: 'New roof system warranty plus documented structural repair scope',
      scope: [
        'Coordinate tree removal, emergency dry-in, and structural framing repairs',
        'Rebuild damaged rafters and replace compromised decking',
        'Install the full replacement roof once the structure was secure',
      ],
      outcomes: [
        'Made the home weather-tight overnight',
        'Returned the family to the master suite within one week',
        'Wrapped structural, roofing, and cleanup coordination under one project plan',
      ],
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
      title: 'Full Fiber Cement Siding Replacement',
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
  return projects.items.find((project) => project.slug === slug)
}

export function getFeaturedProjects(): Project[] {
  return projects.items.filter((project) => project.featured)
}
