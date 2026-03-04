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

function heroSrcSet(src: string) {
  const dot = src.lastIndexOf('.')
  const base = src.substring(0, dot)
  const ext = src.substring(dot)
  return `${base}-768w${ext} 768w, ${base}-1280w${ext} 1280w, ${src} 1920w`
}

function heroAvifSrcSet(src: string) {
  const dot = src.lastIndexOf('.')
  const base = src.substring(0, dot)
  return `${base}-768w.avif 768w, ${base}-1280w.avif 1280w, ${base}.avif 1920w`
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
      {/* Background — uses <picture> with AVIF primary and WebP fallback for LCP optimization */}
      <picture>
        <source
          srcSet={heroAvifSrcSet(backgroundImage)}
          sizes="100vw"
          type="image/avif"
        />
        <source
          srcSet={heroSrcSet(backgroundImage)}
          sizes="100vw"
          type="image/webp"
        />
        <img
          src={backgroundImage}
          alt=""
          role="presentation"
          fetchPriority="high"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-navy/30" />

      {/* Content — renders instantly, no animation delay for LCP */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
        <div className="max-w-2xl">
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
        </div>
      </div>
    </section>
  )
}
