import { motion } from 'framer-motion'
import { Heart, Shield, Users, Star, Home, Building } from 'lucide-react'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'

const values = [
  { icon: Heart, title: 'Integrity', description: 'Doing the right thing even when no one is watching.' },
  { icon: Shield, title: 'Honesty', description: "Honest advice; we'll tell you if you don't need a new roof." },
  { icon: Users, title: 'Family', description: 'Treat customers like family; explain, answer calls, stand behind work.' },
  { icon: Star, title: 'Excellence', description: 'Pursue excellence in every shingle, seam, and interaction.' },
  { icon: Home, title: 'Protection', description: 'Protect your home from weather and poor contractors.' },
  { icon: Building, title: 'Community', description: 'Local focus; committed to stronger communities.' },
]

// TODO: Replace with your team members and photos
const team = [
  { name: 'Alex Johnson', title: 'Founder & Owner', image: '/images/team-mike-thompson.webp' },
  { name: 'Mike Thompson', title: 'Project Manager', image: '/images/team-mike-thompson.webp' },
  { name: 'Sarah Mitchell', title: 'Office Administrator', image: '/images/team-sarah-mitchell.webp' },
  { name: 'James Carter', title: 'Sales Consultant', image: '/images/team-james-carter.webp' },
  { name: 'David Chen', title: 'Sales Consultant', image: '/images/team-david-chen.webp' },
  { name: 'Marcus Williams', title: 'Sales Consultant', image: '/images/team-marcus-williams.webp' },
  { name: 'Emily Rodriguez', title: 'Sales Consultant', image: '/images/team-emily-rodriguez.webp' },
  { name: 'Lisa Nguyen', title: 'Customer Service', image: '/images/team-lisa-nguyen.webp' },
]

const certs = [
  'BBB A+ Rating',
  'Licensed & Insured',
  'Manufacturer Certified Installer',
  'Workmanship Warranty',
  'Industry Award Winner',
  'Background-Checked Crews',
]

export default function About() {
  const { ref: valuesRef, isInView: valuesInView } = useScrollReveal()
  const { ref: teamRef, isInView: teamInView } = useScrollReveal()
  const { ref: certsRef, isInView: certsInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="About Us" description="A family business built on integrity and a commitment to protecting your home. Meet our team and learn our story." path="/about" />
      <Hero
        backgroundImage="/images/about-hero.webp"
        headline="Our"
        highlightText="Story"
        subhead="A family business built on integrity and a commitment to protecting your home."
        compact
      />

      {/* Values */}
      <section className="py-20 lg:py-28" ref={valuesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              Our Core Values
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                  <v.icon className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-1">{v.title}</h3>
                <p className="text-sm text-text-secondary">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28 bg-surface" ref={teamRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={teamInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary max-w-2xl mx-auto"
            >
              The people behind the promise – dedicated professionals who treat your home like their own.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
                className="text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square rounded-2xl object-cover mb-3"
                  loading="lazy"
                />
                <h4 className="font-bold text-navy text-sm">{member.name}</h4>
                <p className="text-xs text-text-secondary">{member.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 lg:py-28" ref={certsRef}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={certsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-extrabold text-navy mb-4"
            >
              Certifications & Awards
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {certs.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={certsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className="bg-surface rounded-xl border border-border p-4 text-center"
              >
                <Shield className="w-6 h-6 text-brand-blue mx-auto mb-2" />
                <p className="text-sm font-medium text-navy">{cert}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
