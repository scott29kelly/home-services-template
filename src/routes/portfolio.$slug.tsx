import type { Route } from './+types/portfolio.$slug'
import { redirect, Link } from 'react-router'
import { ArrowLeft, MapPin, Tag } from 'lucide-react'
import PageMeta from '../components/ui/PageMeta'
import Hero from '../components/sections/Hero'
import CTA from '../components/sections/CTA'
import SectionHeading from '../components/ui/SectionHeading'
import BeforeAfterSlider from '../components/ui/BeforeAfterSlider'
import TestimonialCard from '../components/ui/TestimonialCard'
import JsonLd from '../components/seo/JsonLd'
import { buildProjectSchema, buildBreadcrumbSchema } from '../lib/seo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { projects, getProjectBySlug } from '../config/projects'
import { testimonials } from '../config/testimonials'

export async function loader({ params }: Route.LoaderArgs) {
  const project = params.slug ? getProjectBySlug(params.slug) : undefined
  if (!project) throw redirect('/projects', { status: 301 })
  return { project }
}

export default function PortfolioDetailRoute({ loaderData }: Route.ComponentProps) {
  const { project } = loaderData
  const { ref, isInView } = useScrollReveal()
  const { ref: relRef, isInView: relInView } = useScrollReveal()

  const relatedProjects = projects.items
    .filter((candidate) => candidate.category === project.category && candidate.id !== project.id)
    .slice(0, 3)

  const projectTestimonial = testimonials.all.find(
    (testimonial) => testimonial.projectSlug === project.slug,
  )

  const categoryLabel =
    project.category === 'roofing'
      ? 'Roofing'
      : project.category === 'siding'
        ? 'Siding'
        : 'Storm Damage'

  const projectDescription = project.description || project.detail
  const proofItems = [
    { label: 'Project type', value: project.detail },
    ...(project.system ? [{ label: 'Installed system', value: project.system }] : []),
    ...(project.timeline ? [{ label: 'Timeline', value: project.timeline }] : []),
    ...(project.warranty ? [{ label: 'Warranty', value: project.warranty }] : []),
  ]

  return (
    <>
      <PageMeta
        title={project.title}
        description={projectDescription}
        path={`/portfolio/${project.slug}`}
      />
      <JsonLd data={buildProjectSchema(project)} />
      <JsonLd data={buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
        { name: project.title, url: `/portfolio/${project.slug}` },
      ])} />

      <Hero
        backgroundImage={project.image}
        headline={project.title}
        highlightText=""
        subhead={`${project.location} - ${project.detail}`}
        compact
      />

      <section className="py-20 lg:py-28" ref={ref}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className={`scroll-reveal ${isInView ? 'in-view' : ''}`}>
            <Link
              to="/projects"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-blue transition-colors hover:text-navy"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Link>

            <div className="mb-8">
              <h1 className="mb-4 text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-blue" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-brand-blue" />
                  <span className="capitalize">{categoryLabel}</span>
                </span>
              </div>
            </div>

            <div className="prose prose-lg mb-10 max-w-none">
              <p className="text-lg leading-relaxed text-text-secondary">{projectDescription}</p>
            </div>
          </div>

          {proofItems.length > 0 && (
            <div
              className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2`}
              style={{ transitionDelay: '0.1s' }}
            >
              {proofItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy sm:text-base">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div
            className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-12 overflow-hidden rounded-2xl border border-border`}
            style={{ transitionDelay: '0.15s' }}
          >
            <img
              src={project.image}
              alt={project.title}
              width={1200}
              height={800}
              loading="eager"
              decoding="async"
              className="h-64 w-full object-cover sm:h-80 lg:h-[500px]"
            />
          </div>

          {(project.scope || project.outcomes) && (
            <div
              className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2`}
              style={{ transitionDelay: '0.22s' }}
            >
              {project.scope && project.scope.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-6">
                  <SectionHeading
                    title="Project Scope"
                    subtitle="What went into the job."
                    align="left"
                    className="mb-5"
                  />
                  <ul className="space-y-3 text-sm leading-relaxed text-text-secondary">
                    {project.scope.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.outcomes && project.outcomes.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-6">
                  <SectionHeading
                    title="Project Outcomes"
                    subtitle="What improved for the homeowner."
                    align="left"
                    className="mb-5"
                  />
                  <ul className="space-y-3 text-sm leading-relaxed text-text-secondary">
                    {project.outcomes.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-safety-orange" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {projectTestimonial && (
            <div
              className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-12`}
              style={{ transitionDelay: '0.28s' }}
            >
              <SectionHeading
                title="Customer Feedback"
                subtitle="What the homeowner said after the project wrapped."
                align="left"
                className="mb-6"
              />
              <TestimonialCard testimonial={projectTestimonial} showProjectLink={false} />
            </div>
          )}

          {project.beforeImage && project.afterImage && (
            <div
              className={`scroll-reveal ${isInView ? 'in-view' : ''} mb-12`}
              style={{ transitionDelay: '0.34s' }}
            >
              <SectionHeading
                title="Before & After"
                subtitle="Drag the slider to compare the transformation."
                align="left"
                className="mb-6"
              />
              <div className="overflow-hidden rounded-2xl border border-border">
                <BeforeAfterSlider
                  beforeImage={project.beforeImage}
                  afterImage={project.afterImage}
                  className="h-64 rounded-none sm:h-80 lg:h-[450px]"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="bg-surface py-20 lg:py-28" ref={relRef}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              title="Related Projects"
              subtitle={`More ${categoryLabel.toLowerCase()} work from our team.`}
              className="mb-10"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((related, index) => (
                <div
                  key={related.id}
                  className={`scroll-reveal ${relInView ? 'in-view' : ''}`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <Link
                    to={`/portfolio/${related.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-border bg-white transition-shadow duration-300 hover:shadow-lg"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        width={800}
                        height={600}
                        loading="lazy"
                        decoding="async"
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium capitalize text-navy backdrop-blur-sm">
                        {related.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="mb-1 font-bold text-navy transition-colors group-hover:text-brand-blue">
                        {related.title}
                      </h3>
                      <p className="text-sm text-text-secondary">{related.location}</p>
                      <p className="mt-1 text-xs font-medium text-brand-blue">{related.detail}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTA />
    </>
  )
}
