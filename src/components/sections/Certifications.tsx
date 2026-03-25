import { Trophy, Shield, Award } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'

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
    <section className="py-20 lg:py-28" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          title="Trusted & Certified"
          subtitle="Our certifications represent our commitment to excellence and continuous training."
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {certs.map((cert, i) => (
            <div
              key={i}
              className={`scroll-reveal ${isInView ? 'in-view' : ''} text-center`}
              style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <cert.icon className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-1">{cert.title}</h3>
              <p className="text-text-secondary text-sm">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
