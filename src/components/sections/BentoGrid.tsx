import { m } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, PanelLeft, CloudLightning } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export default function BentoGrid() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-14" ref={ref}>
          <SectionHeading
            title="Our Services"
            subtitle="From storm damage repair to complete roof replacements, we deliver quality craftsmanship backed by industry-leading warranties."
          />
        </div>

        <m.div
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 gap-4 lg:gap-6"
        >
          {/* Roofing - Large Left */}
          <m.div variants={item} className="lg:row-span-2">
            <Link
              to="/roofing"
              className="group relative block h-full min-h-[320px] lg:min-h-0 rounded-2xl overflow-hidden bg-navy"
            >
              <img
                src="/images/hero-roofing.webp"
                alt="Roofing services"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Roofing</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                  Complete roof replacements, repairs, and maintenance using premium materials.
                  Manufacturer certified installers.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-safety-orange group-hover:gap-2 transition-all">
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          </m.div>

          {/* Siding - Top Right */}
          <m.div variants={item} className="lg:col-span-2">
            <Link
              to="/siding"
              className="group relative block h-full min-h-[220px] rounded-2xl overflow-hidden bg-navy"
            >
              <img
                src="/images/siding-hero.webp"
                alt="Siding services"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <PanelLeft className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Siding</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">
                  Transform your home's exterior with durable vinyl siding. Expert installation
                  with lasting beauty.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-safety-orange group-hover:gap-2 transition-all">
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          </m.div>

          {/* Storm Repair - Bottom Right */}
          <m.div variants={item} className="lg:col-span-2">
            <Link
              to="/storm-damage"
              className="group relative block h-full min-h-[220px] rounded-2xl overflow-hidden bg-navy"
            >
              <img
                src="/images/storm-damage-hero.webp"
                alt="Storm damage repair"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
              />
              <div className="relative h-full flex flex-col justify-end p-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <CloudLightning className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Storm Repair</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-md">
                  Fast response storm damage repair. We handle insurance claims and get your home
                  restored quickly.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-safety-orange group-hover:gap-2 transition-all">
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
