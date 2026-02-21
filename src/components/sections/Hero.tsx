import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { SITE } from '../../config/site'

interface HeroProps {
  backgroundImage?: string
  headline?: string
  highlightText?: string
  subhead?: string
  primaryCTA?: { text: string; href: string }
  secondaryCTA?: { text: string; href: string; external?: boolean }
  compact?: boolean
}

export default function Hero({
  backgroundImage = '/images/hero-roofing.webp',
  headline = 'Protecting Your Home,',
  highlightText = 'One Roof at a Time',
  subhead = 'Expert roofing, siding, and storm damage repair with integrity. We guide you through every step of the insurance claims process.',
  primaryCTA = { text: 'Get Free Inspection', href: '/contact' },
  secondaryCTA = { text: `Call ${SITE.phone}`, href: `tel:${SITE.phone}`, external: true },
  compact = false,
}: HeroProps) {
  return (
    <section
      className={`relative overflow-hidden ${compact ? 'min-h-[400px]' : 'min-h-[600px] lg:min-h-[700px]'} flex items-center`}
    >
      {/* Background — uses <img> for LCP optimization and accessibility */}
      <img
        src={backgroundImage}
        alt=""
        role="presentation"
        fetchPriority="high"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-navy/30" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {headline}{' '}
            <span className="text-safety-orange">{highlightText}</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
            {subhead}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" href={primaryCTA.href}>
              {primaryCTA.text}
            </Button>
            <Button
              variant="outline-white"
              size="lg"
              href={secondaryCTA.href}
              external={secondaryCTA.external}
            >
              {secondaryCTA.text}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
