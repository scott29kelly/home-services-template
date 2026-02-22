/**
 * Testimonial configuration.
 * `featured` are shown on the homepage; `all` includes the full set for the testimonials page.
 */

export interface Testimonial {
  name: string
  location: string
  quote: string
  image: string
  service?: string
}

export const testimonials = {
  /** Shown on the homepage (max 3 recommended) */
  featured: [
    {
      name: 'Michael R.',
      location: 'Anytown',
      quote:
        'They made our roof replacement seamless. The team handled everything with the insurance company. Couldn\'t be happier!',
      image: '/images/testimonial-1.webp',
    },
    {
      name: 'Jennifer T.',
      location: 'Springfield',
      quote:
        "After the storm, I didn't know where to start. They walked me through the entire insurance process and delivered a beautiful new roof.",
      image: '/images/testimonial-2.webp',
    },
    {
      name: 'David & Susan K.',
      location: 'Riverside',
      quote:
        'Professional, honest, and they stand behind their work. The new siding transformed our home. Highly recommend!',
      image: '/images/testimonial-3.webp',
    },
  ] satisfies Testimonial[],

  /** Full set for the testimonials page */
  all: [
    {
      name: 'Michael R.',
      location: 'Anytown',
      service: 'Roofing',
      quote:
        "They made our roof replacement seamless. After a bad hail storm, the team came out and found damage we couldn't see from the ground. They handled everything with our insurance company and we got a brand new roof. The crew was professional, on time, and left our property cleaner than when they arrived. Couldn't be happier!",
      image: '/images/testimonial-1.webp',
    },
    {
      name: 'Jennifer T.',
      location: 'Springfield',
      service: 'Storm Repair',
      quote:
        "After the storm, I didn't know where to start with my insurance claim. They walked me through the entire process step by step. They met with the adjuster, documented everything, and made sure I got fair coverage. Now I have a beautiful new roof and barely paid anything out of pocket.",
      image: '/images/testimonial-2.webp',
    },
    {
      name: 'David & Susan K.',
      location: 'Riverside',
      service: 'Siding',
      quote:
        "Professional, honest, and they stand behind their work. The new siding transformed our 1980s home into something that looks brand new. Everyone who drives by comments on how great it looks. The team is the real deal.",
      image: '/images/testimonial-3.webp',
    },
    {
      name: 'Robert H.',
      location: 'Fairview',
      service: 'Insurance',
      quote:
        "I had three other companies come out after the storm. Two said I didn't have damage worth claiming. This team found significant hail damage and helped me get a full roof replacement covered by insurance. They were honest from day one and delivered exactly what they promised.",
      image: '/images/testimonial-4.webp',
    },
    {
      name: 'Paul S.',
      location: 'Lakewood',
      service: 'Multi-Property',
      quote:
        "As a property manager, I've worked with a lot of contractors. This is one of the few companies I trust completely. They've done roofs on multiple properties for us and every job has been excellent. Communication, quality, and pricing are all top-notch.",
      image: '/images/testimonial-5.webp',
    },
    {
      name: 'Lisa M.',
      location: 'Georgetown',
      service: 'Storm Repair',
      quote:
        "We were nervous about the whole insurance claim process, but they made it so easy. They took photos, wrote up the damage report, met with our adjuster, and coordinated everything. Three weeks later we had a new roof. These guys know what they're doing.",
      image: '/images/testimonial-6.webp',
    },
    {
      name: 'Tom C.',
      location: 'Cedar Park',
      service: 'Roofing',
      quote:
        "Great family-owned company with real integrity. The owner personally made sure everything was done right. When there was a small issue with some flashing, they came back the same day to fix it. That's the kind of service you don't find anymore.",
      image: '/images/testimonial-7.webp',
    },
    {
      name: 'Angela M.',
      location: 'Madison',
      service: 'Siding',
      quote:
        "From start to finish, they exceeded our expectations. The siding samples they brought helped us choose the perfect color. Installation was quick and the crew was respectful of our property. Our home looks incredible and we've already recommended them to three neighbors.",
      image: '/images/testimonial-8.webp',
    },
  ] satisfies Testimonial[],

  ratingBadges: [
    { icon: 'Star', label: '4.9 Stars', sublabel: '150+ reviews' },
    { icon: 'Shield', label: 'BBB A+ Rating', sublabel: 'Accredited' },
    { icon: 'Award', label: 'Industry Award', sublabel: 'Top Rated' },
    { icon: 'Medal', label: 'Quality Certified', sublabel: 'Excellence' },
  ],
}
