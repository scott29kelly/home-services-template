import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'

type Category = 'all' | 'roofing' | 'siding' | 'storm'

const projects = [
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
]

const beforeAfter = [
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
]

const filters: { value: Category; label: string }[] = [
  { value: 'all', label: 'All Projects' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'siding', label: 'Siding' },
  { value: 'storm', label: 'Storm Damage' },
]

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<Category>('all')
  const { ref, isInView } = useScrollReveal()
  const { ref: baRef, isInView: baInView } = useScrollReveal()

  const filtered = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter)

  return (
    <>
      <PageMeta title="Project Gallery" description="See real roofing, siding, and storm damage repair transformations from homeowners across our service area." path="/projects" />
      <Hero
        backgroundImage="/images/projects-hero.webp"
        headline="Our Project"
        highlightText="Gallery"
        subhead="See the quality of our work through real transformations from homeowners across the region."
        compact
      />

      {/* Gallery */}
      <section className="py-20 lg:py-28" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  activeFilter === f.value
                    ? 'bg-navy text-white'
                    : 'bg-surface text-navy/60 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-navy capitalize">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-navy mb-1">{project.title}</h3>
                    <p className="text-sm text-text-secondary">{project.location}</p>
                    <p className="text-xs text-brand-blue font-medium mt-1">{project.detail}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Before & After */}
      <section className="py-20 lg:py-28 bg-surface" ref={baRef}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={baInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-extrabold text-navy mb-10 text-center"
          >
            Before & After
          </motion.h2>

          <div className="space-y-10">
            {beforeAfter.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={baInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div className="relative">
                    <img src={item.before} alt="Before" className="w-full h-64 object-cover" loading="lazy" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 text-white text-xs font-medium rounded-full">
                      Before
                    </span>
                  </div>
                  <div className="relative">
                    <img src={item.after} alt="After" className="w-full h-64 object-cover" loading="lazy" />
                    <span className="absolute bottom-3 left-3 px-3 py-1 bg-brand-blue text-white text-xs font-medium rounded-full">
                      After
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-navy">{item.title}</h3>
                  <p className="text-sm text-text-secondary">
                    {item.location} &mdash; {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
