import { m } from 'framer-motion'
import { Star } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import Button from '../ui/Button'
import SectionHeading from '../ui/SectionHeading'
import { testimonials } from '../../config/testimonials'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export default function Testimonials() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Don't just take our word for it -- hear from homeowners we've helped."
          theme="dark"
          className="mb-14"
        />

        <m.div
          variants={container}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.featured.map((t, i) => (
            <m.div
              key={i}
              variants={item}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={t.image}
                  alt={`${t.name} - ${t.location} homeowner`}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-sm text-white/50">{t.location}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-safety-orange text-safety-orange" />
                ))}
              </div>
              <blockquote className="text-white/70 leading-relaxed text-sm">
                "{t.quote}"
              </blockquote>
            </m.div>
          ))}
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-10"
        >
          <Button variant="outline-white" href="/testimonials">
            Read More Reviews
          </Button>
        </m.div>
      </div>
    </section>
  )
}
