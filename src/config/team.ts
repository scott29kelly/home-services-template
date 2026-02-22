/**
 * Team, values, and about-page configuration.
 */

export interface TeamMember {
  name: string
  title: string
  image: string
}

export interface Value {
  icon: string
  title: string
  description: string
}

export const team = {
  members: [
    { name: 'Alex Johnson', title: 'Founder & Owner', image: '/images/team-mike-thompson.webp' },
    { name: 'Mike Thompson', title: 'Project Manager', image: '/images/team-mike-thompson.webp' },
    { name: 'Sarah Mitchell', title: 'Office Administrator', image: '/images/team-sarah-mitchell.webp' },
    { name: 'James Carter', title: 'Sales Consultant', image: '/images/team-james-carter.webp' },
    { name: 'David Chen', title: 'Sales Consultant', image: '/images/team-david-chen.webp' },
    { name: 'Marcus Williams', title: 'Sales Consultant', image: '/images/team-marcus-williams.webp' },
    { name: 'Emily Rodriguez', title: 'Sales Consultant', image: '/images/team-emily-rodriguez.webp' },
    { name: 'Lisa Nguyen', title: 'Customer Service', image: '/images/team-lisa-nguyen.webp' },
  ] satisfies TeamMember[],

  values: [
    { icon: 'Heart', title: 'Integrity', description: 'Doing the right thing even when no one is watching.' },
    { icon: 'Shield', title: 'Honesty', description: "Honest advice; we'll tell you if you don't need a new roof." },
    { icon: 'Users', title: 'Family', description: 'Treat customers like family; explain, answer calls, stand behind work.' },
    { icon: 'Star', title: 'Excellence', description: 'Pursue excellence in every shingle, seam, and interaction.' },
    { icon: 'Home', title: 'Protection', description: 'Protect your home from weather and poor contractors.' },
    { icon: 'Building', title: 'Community', description: 'Local focus; committed to stronger communities.' },
  ] satisfies Value[],

  certifications: [
    'BBB A+ Rating',
    'Licensed & Insured',
    'Manufacturer Certified Installer',
    'Workmanship Warranty',
    'Industry Award Winner',
    'Background-Checked Crews',
  ],
}
