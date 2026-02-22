import { m } from 'framer-motion'
import { Trophy, Shield, Award } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const certs = [
  {
    icon: Trophy,
    title: 'BBB A+ Rating',
    description: 'Accredited and top-rated',
  },
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Fully licensed in every state we serve',
  },
  {
    icon: Award,
    title: 'Manufacturer Certified',
    description: 'Certified by top roofing manufacturers',
  },
]

export default function Certifications() {
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
          >
            Trusted & Certified
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Our certifications represent our commitment to excellence and continuous training.
          </m.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {certs.map((cert, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <cert.icon className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">{cert.title}</h3>
              <p className="text-text-secondary text-sm">{cert.description}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
