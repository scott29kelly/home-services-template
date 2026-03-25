/**
 * Service definitions.
 * Each entry generates a route, nav item, and renders via the ServicePage template.
 * To add a new service, add an entry here — navigation and routing update automatically.
 */

/* ── Section types ────────────────────────────────────────────────── */

export interface CardGridSection {
  type: 'cardGrid'
  bg?: 'white' | 'surface'
  title: string
  subtitle?: string
  columns?: 2 | 3
  cards: { title: string; image: string; description: string; features: string[] }[]
}

export interface IconGridSection {
  type: 'iconGrid'
  bg?: 'white' | 'surface'
  title: string
  subtitle?: string
  columns?: 2 | 3 | 4
  colorScheme?: 'blue' | 'orange'
  cards: { icon: string; title: string; description: string }[]
}

export interface MaterialGridSection {
  type: 'materialGrid'
  bg?: 'white' | 'surface'
  title: string
  subtitle?: string
  cards: { title: string; description: string; items: string[] }[]
}

export interface StyleGallerySection {
  type: 'styleGallery'
  bg?: 'white' | 'surface'
  title: string
  subtitle?: string
  cards: { title: string; image: string; description: string }[]
}

export interface CertBarSection {
  type: 'certBar'
  items: string[]
}

export interface EmergencyBannerSection {
  type: 'emergencyBanner'
  text: string
  ctaText: string
  ctaHref: string
}

export interface ProcessTimelineSection {
  type: 'processTimeline'
}

export interface TrustSection {
  type: 'trustSection'
  bg?: 'white' | 'surface'
  title: string
  subtitle: string
  trustPoints: { title: string; description: string }[]
  ctaText: string
  ctaHref: string
  sidebar: {
    title: string
    icon: string
    items: string[]
    footnote?: string
  }
}

export type ServiceSection =
  | CardGridSection
  | IconGridSection
  | MaterialGridSection
  | StyleGallerySection
  | CertBarSection
  | EmergencyBannerSection
  | ProcessTimelineSection
  | TrustSection

/* ── Service config shape ─────────────────────────────────────────── */

export interface ServiceConfig {
  slug: string
  name: string
  navLabel: string
  icon: string
  hero: {
    backgroundImage: string
    headline: string
    highlightText: string
    subhead: string
    primaryCTA?: { text: string; href: string }
    showEmergencyPhone?: boolean
  }
  meta: { title: string; description: string }
  /** Overview shown on the /services listing page */
  overview: { image: string; description: string }
  sections: ServiceSection[]
  faqs: { title: string; items: { question: string; answer: string }[] }
}

/* ── Service data ─────────────────────────────────────────────────── */

export const services: ServiceConfig[] = [
  /* ───────── Roofing ───────── */
  {
    slug: 'roofing',
    name: 'Roofing',
    navLabel: 'Roofing',
    icon: 'Home',
    hero: {
      backgroundImage: '/images/hero-roofing.webp',
      headline: 'Professional',
      highlightText: 'Roofing Services',
      subhead:
        'Expert roof replacement, repairs, and maintenance backed by industry-leading warranties and certified installation.',
    },
    meta: {
      title: 'Roofing Services',
      description:
        'Professional roof replacement, repairs, and maintenance. Certified installers with manufacturer warranties. Free inspections.',
    },
    overview: {
      image: '/images/hero-roofing.webp',
      description:
        'Replacements, repairs, and inspections using premium materials from top manufacturers. Certified installers and manufacturer warranties.',
    },
    sections: [
      {
        type: 'certBar',
        items: ['Licensed & Insured', 'Manufacturer Certified', 'A+ BBB Rated'],
      },
      {
        type: 'cardGrid',
        title: 'Our Roofing Services',
        subtitle:
          'From minor repairs to complete roof replacements, we handle it all with precision and care.',
        columns: 3,
        cards: [
          {
            title: 'Roof Replacement',
            image: '/images/roof-replacement.webp',
            description:
              "Complete tear-off and replacement using premium architectural shingles. We don't layer over old roofs \u2013 we do it right.",
            features: [
              'Full tear-off and inspection',
              'Premium underlayment',
              'Architectural shingles',
              '50-year warranties available',
            ],
          },
          {
            title: 'Roof Repairs',
            image: '/images/roof-repair.webp',
            description:
              "Fast, reliable repairs for leaks, missing shingles, flashing issues, and storm damage. We'll identify and fix the problem.",
            features: [
              'Leak detection & repair',
              'Shingle replacement',
              'Flashing repairs',
              'Emergency services',
            ],
          },
          {
            title: 'Roof Inspections',
            image: '/images/roof-inspection.webp',
            description:
              "Comprehensive inspections to assess your roof's condition. Perfect after storms or before buying/selling a home.",
            features: [
              'Free storm damage inspections',
              'Detailed condition reports',
              'Photo documentation',
              'Insurance claim support',
            ],
          },
        ],
      },
      {
        type: 'materialGrid',
        bg: 'surface',
        title: 'Premium Roofing Materials',
        subtitle: 'We only use top-tier materials from trusted manufacturers.',
        cards: [
          {
            title: 'Asphalt Shingles',
            description:
              'The most popular choice for homeowners. Durable, affordable, and available in many styles and colors.',
            items: [
              '3-tab shingles',
              'Architectural/dimensional shingles',
              'Designer shingles',
              'Impact-resistant options',
            ],
          },
          {
            title: 'Our Partner Brands',
            description:
              "We're certified installers for the industry's best manufacturers:",
            items: [
              "GAF \u2013 America's #1 shingle brand",
              'CertainTeed \u2013 Premium quality',
              'Atlas \u2013 Innovation leaders',
              'Owens Corning \u2013 Trusted performance',
            ],
          },
        ],
      },
    ],
    faqs: {
      title: 'Roofing FAQs',
      items: [
        {
          question: 'How long does a roof replacement take?',
          answer:
            'Most residential roof replacements are completed in 1-3 days, depending on the size of your home and weather conditions. We work efficiently while maintaining our quality standards.',
        },
        {
          question: 'What warranty do you offer?',
          answer:
            'We offer comprehensive warranties that include both manufacturer warranties (up to 50 years on materials) and our own workmanship warranty. As certified installers, we can offer enhanced warranty options.',
        },
        {
          question: 'Will insurance cover my roof replacement?',
          answer:
            "If your roof has storm damage, your homeowner's insurance may cover the replacement. We specialize in helping homeowners navigate the insurance claims process and will work directly with your adjuster.",
        },
        {
          question: 'How do I know if I need a new roof?',
          answer:
            "Signs you may need a new roof include: shingles that are curling, cracking, or missing; granules in your gutters; daylight visible through the roof boards; sagging roof deck; or a roof that's 20+ years old. Schedule a free inspection and we'll give you an honest assessment.",
        },
      ],
    },
  },

  /* ───────── Siding ───────── */
  {
    slug: 'siding',
    name: 'Siding',
    navLabel: 'Siding',
    icon: 'PanelLeft',
    hero: {
      backgroundImage: '/images/siding-hero.webp',
      headline: 'Transform Your Home with',
      highlightText: 'New Siding',
      subhead:
        'Beautiful, durable vinyl siding that protects your home and increases curb appeal. Expert installation with lasting results.',
    },
    meta: {
      title: 'Siding Services',
      description:
        'Transform your home with beautiful, durable vinyl siding. Expert installation with lasting results. Free estimates.',
    },
    overview: {
      image: '/images/siding-hero.webp',
      description:
        'Vinyl siding in multiple styles \u2013 horizontal lap, Dutch lap, board & batten, shake. Durable, energy-efficient installation.',
    },
    sections: [
      {
        type: 'iconGrid',
        title: 'Why Choose New Siding?',
        subtitle: "Upgrade your home's exterior with benefits that last for decades.",
        columns: 4,
        colorScheme: 'blue',
        cards: [
          { icon: 'Palette', title: 'Enhanced Curb Appeal', description: "Transform your home's look with modern colors and styles." },
          { icon: 'DollarSign', title: 'Increased Value', description: 'Siding replacement offers one of the best returns on investment.' },
          { icon: 'Thermometer', title: 'Energy Efficiency', description: 'Insulated siding helps reduce heating and cooling costs.' },
          { icon: 'Wrench', title: 'Low Maintenance', description: 'No painting required \u2013 just occasional cleaning.' },
        ],
      },
      {
        type: 'cardGrid',
        bg: 'surface',
        title: 'Our Siding Services',
        columns: 2,
        cards: [
          {
            title: 'Vinyl Siding Installation',
            image: '/images/vinyl-siding.webp',
            description:
              'Our most popular option. Vinyl siding is durable, affordable, and available in countless colors and styles to match any home.',
            features: ['Wide color selection', 'Weather resistant', 'Fade resistant', '25+ year warranties'],
          },
          {
            title: 'Siding Repair',
            image: '/images/siding-repair.webp',
            description:
              "Storm damage or wear and tear? We can repair or replace damaged sections to restore your home's protection and appearance.",
            features: ['Storm damage repair', 'Section replacement', 'Color matching', 'Insurance claims assistance'],
          },
        ],
      },
      {
        type: 'styleGallery',
        title: 'Siding Styles & Options',
        subtitle: 'Find the perfect look for your home.',
        cards: [
          { title: 'Horizontal Lap Siding', image: '/images/siding-horizontal.webp', description: 'The classic American look. Clean horizontal lines that work with any architectural style.' },
          { title: 'Dutch Lap Siding', image: '/images/siding-dutch.webp', description: "A decorative groove adds shadow lines and visual interest to your home's exterior." },
          { title: 'Board & Batten', image: '/images/siding-board-batten.webp', description: 'Vertical siding with a farmhouse-inspired look. Perfect for accent areas or full coverage.' },
          { title: 'Shake & Shingle', image: '/images/siding-shake.webp', description: 'The charm of cedar shakes without the maintenance. Great for gables and accent areas.' },
          { title: 'Scallop Siding', image: '/images/siding-scallop.webp', description: 'Decorative scalloped edges for Victorian and cottage-style homes.' },
          { title: 'Insulated Siding', image: '/images/siding-insulated.webp', description: 'Built-in foam backing increases energy efficiency and reduces outside noise.' },
        ],
      },
    ],
    faqs: {
      title: 'Siding FAQs',
      items: [
        { question: 'How long does vinyl siding last?', answer: 'Quality vinyl siding can last 25-40 years or more with proper installation. Most manufacturers offer warranties of 25+ years, and some offer lifetime limited warranties.' },
        { question: 'How do I maintain vinyl siding?', answer: "Vinyl siding is virtually maintenance-free. An occasional rinse with a garden hose is usually all that's needed. For tougher dirt, a soft brush and mild detergent work well." },
        { question: 'Can siding be installed over existing siding?', answer: 'In some cases, yes. However, we typically recommend removing old siding to inspect the underlying structure for damage or rot. This ensures the best long-term results.' },
        { question: 'Will insurance cover storm-damaged siding?', answer: "Yes, storm damage to siding is typically covered by homeowner's insurance. We specialize in insurance claims and will help you document the damage and work with your adjuster." },
      ],
    },
  },

  /* ───────── Storm Damage ───────── */
  {
    slug: 'storm-damage',
    name: 'Storm Damage Repair',
    navLabel: 'Storm Repair',
    icon: 'CloudLightning',
    hero: {
      backgroundImage: '/images/storm-damage-hero.webp',
      headline: 'Storm Damage?',
      highlightText: "We're Here to Help.",
      subhead:
        "Fast response storm damage repair. We handle the insurance claims process so you don't have to stress.",
      primaryCTA: { text: 'Request Free Inspection', href: '/contact' },
      showEmergencyPhone: true,
    },
    meta: {
      title: 'Storm Damage Repair',
      description:
        "Fast response storm damage repair. We handle insurance claims so you don't have to stress. Free inspections.",
    },
    overview: {
      image: '/images/storm-damage-hero.webp',
      description:
        'Fast response for hail, wind, and tree damage. Full support through the insurance claims process.',
    },
    sections: [
      {
        type: 'emergencyBanner',
        text: "Had a recent storm? Don't wait \u2013 water damage gets worse over time.",
        ctaText: 'Get Inspected Today',
        ctaHref: '/contact',
      },
      {
        type: 'iconGrid',
        title: 'Types of Storm Damage We Repair',
        subtitle: "We're experts in identifying and repairing all types of storm damage to your home.",
        columns: 3,
        colorScheme: 'orange',
        cards: [
          { icon: 'CloudHail', title: 'Hail Damage', description: "Hail can crack, dent, and dislodge shingles \u2013 often in ways that aren't visible from the ground. We identify all damage for your claim." },
          { icon: 'Wind', title: 'Wind Damage', description: 'High winds can lift, tear, or completely remove shingles. We assess wind damage patterns and document everything.' },
          { icon: 'TreePine', title: 'Fallen Trees & Debris', description: 'Tree limbs and flying debris can cause serious structural damage. We coordinate repairs and work with your insurance.' },
        ],
      },
      { type: 'processTimeline' },
      {
        type: 'trustSection',
        title: 'Why Homeowners Trust Us for Insurance Claims',
        subtitle:
          "Dealing with storm damage is stressful. Dealing with insurance companies can be even worse. That's why we handle the heavy lifting for you.",
        trustPoints: [
          { title: "We're Your Advocate", description: 'We work for YOU, not the insurance company. Our goal is to ensure you get fair compensation.' },
          { title: 'Thorough Documentation', description: "We document every bit of damage \u2013 even what's not visible from the ground \u2013 so nothing gets missed." },
          { title: 'Adjuster Meeting', description: 'We meet with your adjuster on-site to walk through the damage and ensure proper assessment.' },
          { title: 'No Pressure', description: "Free inspections with no obligation. We'll give you an honest assessment \u2013 even if you don't have damage." },
        ],
        ctaText: 'Schedule Free Inspection',
        ctaHref: '/contact',
        sidebar: {
          title: 'Signs You May Have Storm Damage',
          icon: 'AlertTriangle',
          items: [
            'Missing, cracked, or curling shingles',
            'Dents in gutters, downspouts, or vents',
            'Granules accumulating in gutters',
            'Dented or damaged siding',
            'Water stains on ceilings or walls',
            'Leaks in your attic after rain',
            'Neighbors getting roof work done',
          ],
          footnote:
            'Storm damage isn\'t always visible from the ground. A professional inspection is the only way to know for sure.',
        },
      },
    ],
    faqs: {
      title: 'Storm Damage & Insurance FAQs',
      items: [
        { question: 'How soon should I get my roof inspected after a storm?', answer: "As soon as possible. Storm damage can lead to leaks and further damage if left unaddressed. Most insurance policies also have time limits for filing claims, so don't wait." },
        { question: 'Do I have to pay for the inspection?', answer: "No \u2013 our storm damage inspections are completely free with no obligation. We'll provide an honest assessment of whether you have damage worth filing a claim for." },
        { question: 'Will my insurance rates go up if I file a claim?', answer: 'Storm damage claims are typically "Acts of God" and don\'t affect your rates the same way an at-fault claim might. However, policies vary, so check with your insurance agent.' },
        { question: 'What if my claim is denied?', answer: "Don't give up. Claims are sometimes denied initially but can be appealed with proper documentation. We can help you understand your options and supplement your claim if needed." },
        { question: 'How much will I have to pay out of pocket?', answer: 'Typically, your only out-of-pocket cost is your insurance deductible. We work directly with your insurance to ensure the approved amount covers the cost of quality repairs.' },
      ],
    },
  },
]

/** Look up a service by its URL slug */
export function getServiceBySlug(slug: string): ServiceConfig | undefined {
  return services.find((s) => s.slug === slug)
}
