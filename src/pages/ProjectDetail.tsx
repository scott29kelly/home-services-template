import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { m } from 'framer-motion'
import { ArrowLeft, MapPin, Tag } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { projects, getProjectBySlug } from '../config/projects'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { ref, isInView } = useScrollReveal()
  const { ref: relRef, isInView: relInView } = useScrollReveal()

  const project = slug ? getProjectBySlug(slug) : undefined

  useEffect(() => {
    if (!project) {
      navigate('/projects', { replace: true })
    }
  }, [project, navigate])

  if (!project) return null

  const relatedProjects = projects.items
    .filter(p => p.category === project.category && p.id !== project.id)
    .slice(0, 3)

  const categoryLabel =
    project.category === 'roofing' ? 'Roofing' :
    project.category === 'siding' ? 'Siding' : 'Storm Damage'

  const projectDescription = project.description || project.detail

  return (
    <>
      <PageMeta
        title={project.title}
        description={projectDescription}
        path={`/portfolio/${project.slug}`}
      />

      {/* Hero */}
      <Hero
        backgroundImage={project.image}
        headline={project.title}
        highlightText=""
        subhead={`${project.location} — ${project.detail}`}
        compact
      />

      {/* Project Details */}
      <section className="py-20 lg:py-28" ref={ref}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Back link */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-brand-blue hover:text-navy font-medium text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-blue" />
                  <span className="capitalize">{categoryLabel}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-text-secondary leading-relaxed text-lg">
                {project.description || project.detail}
              </p>
              {project.description && (
                <p className="text-sm font-medium text-brand-blue mt-2">
                  {project.detail}
                </p>
              )}
            </div>
          </m.div>

          {/* Main image */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="rounded-2xl overflow-hidden border border-border mb-12"
          >
            <img
              src={project.image}
              alt={project.title}
              width={1200}
              height={800}
              loading="eager"
              decoding="async"
              className="w-full h-64 sm:h-80 lg:h-[500px] object-cover"
            />
          </m.div>

          {/* Before & After */}
          {project.beforeImage && project.afterImage && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <SectionHeading
                title="Before & After"
                subtitle="Drag the slider to compare the transformation."
                align="left"
                className="mb-6"
              />
              <div className="rounded-2xl overflow-hidden border border-border">
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                  className="h-64 sm:h-80 lg:h-[450px] rounded-none"
                />
              </div>
            </m.div>
          )}
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 lg:py-28 bg-surface" ref={relRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading
              title="Related Projects"
              subtitle={`More ${categoryLabel.toLowerCase()} work from our team.`}
              className="mb-10"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((related, i) => (
                <m.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={relInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={`/portfolio/${related.slug}`}
                    className="group block bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-navy capitalize">
                        {related.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-navy mb-1 group-hover:text-brand-blue transition-colors">
                        {related.title}
                      </h3>
                      <p className="text-sm text-text-secondary">{related.location}</p>
                      <p className="text-xs text-brand-blue font-medium mt-1">{related.detail}</p>
                    </div>
                  </Link>
                </m.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}
