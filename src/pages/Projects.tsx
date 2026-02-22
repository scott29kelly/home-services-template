import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { projects } from '../config/projects'

type Category = 'all' | 'roofing' | 'siding' | 'storm'

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState<Category>('all')
  const { ref, isInView } = useScrollReveal()
  const { ref: baRef, isInView: baInView } = useScrollReveal()

  const filtered = activeFilter === 'all' ? projects.items : projects.items.filter((p) => p.category === activeFilter)

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
            {projects.filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value as Category)}
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
            {projects.beforeAfter.map((item, i) => (
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
