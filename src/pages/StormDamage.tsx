import { motion } from 'framer-motion'
import { CloudHail, Wind, TreePine, CheckCircle, AlertTriangle } from 'lucide-react'
import Hero from '../components/sections/Hero'
import ProcessTimeline from '../components/sections/ProcessTimeline'
import FAQ from '../components/sections/FAQ'
import CTA from '../components/sections/CTA'
import Button from '../components/ui/Button'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'

const damageTypes = [
  {
    icon: CloudHail,
    title: 'Hail Damage',
    description:
      "Hail can crack, dent, and dislodge shingles – often in ways that aren't visible from the ground. We identify all damage for your claim.",
  },
  {
    icon: Wind,
    title: 'Wind Damage',
    description:
      'High winds can lift, tear, or completely remove shingles. We assess wind damage patterns and document everything.',
  },
  {
    icon: TreePine,
    title: 'Fallen Trees & Debris',
    description:
      'Tree limbs and flying debris can cause serious structural damage. We coordinate repairs and work with your insurance.',
  },
]

const trustPoints = [
  {
    title: "We're Your Advocate",
    description: 'We work for YOU, not the insurance company. Our goal is to ensure you get fair compensation.',
  },
  {
    title: 'Thorough Documentation',
    description:
      "We document every bit of damage – even what's not visible from the ground – so nothing gets missed.",
  },
  {
    title: 'Adjuster Meeting',
    description:
      'We meet with your adjuster on-site to walk through the damage and ensure proper assessment.',
  },
  {
    title: 'No Pressure',
    description:
      "Free inspections with no obligation. We'll give you an honest assessment – even if you don't have damage.",
  },
]

const damageSignsList = [
  'Missing, cracked, or curling shingles',
  'Dents in gutters, downspouts, or vents',
  'Granules accumulating in gutters',
  'Dented or damaged siding',
  'Water stains on ceilings or walls',
  'Leaks in your attic after rain',
  'Neighbors getting roof work done',
]

const faqs = [
  {
    question: 'How soon should I get my roof inspected after a storm?',
    answer:
      "As soon as possible. Storm damage can lead to leaks and further damage if left unaddressed. Most insurance policies also have time limits for filing claims, so don't wait.",
  },
  {
    question: 'Do I have to pay for the inspection?',
    answer:
      "No – our storm damage inspections are completely free with no obligation. We'll provide an honest assessment of whether you have damage worth filing a claim for.",
  },
  {
    question: 'Will my insurance rates go up if I file a claim?',
    answer:
      'Storm damage claims are typically "Acts of God" and don\'t affect your rates the same way an at-fault claim might. However, policies vary, so check with your insurance agent.',
  },
  {
    question: 'What if my claim is denied?',
    answer:
      "Don't give up. Claims are sometimes denied initially but can be appealed with proper documentation. We can help you understand your options and supplement your claim if needed.",
  },
  {
    question: 'How much will I have to pay out of pocket?',
    answer:
      'Typically, your only out-of-pocket cost is your insurance deductible. We work directly with your insurance to ensure the approved amount covers the cost of quality repairs.',
  },
]

export default function StormDamage() {
  const { ref: typesRef, isInView: typesInView } = useScrollReveal()
  const { ref: trustRef, isInView: trustInView } = useScrollReveal()

  return (
    <>
      <PageMeta title="Storm Damage Repair" description="Fast response storm damage repair. We handle insurance claims so you don't have to stress. Free inspections." path="/storm-damage" />
      <Hero
        backgroundImage="/images/storm-damage-hero.webp"
        headline="Storm Damage?"
        highlightText="We're Here to Help."
        subhead="Fast response storm damage repair. We handle the insurance claims process so you don't have to stress."
        primaryCTA={{ text: 'Request Free Inspection', href: '/contact' }}
        secondaryCTA={{ text: `Emergency: ${SITE.phone}`, href: `tel:${SITE.phone}`, external: true }}
      />

      {/* Emergency Banner */}
      <div className="bg-safety-orange text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-4 flex-wrap text-center">
          <span className="font-bold">
            Had a recent storm? Don't wait – water damage gets worse over time.
          </span>
          <Button variant="secondary" size="sm" href="/contact">
            Get Inspected Today
          </Button>
        </div>
      </div>

      {/* Damage Types */}
      <section className="py-20 lg:py-28" ref={typesRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={typesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy mb-4"
            >
              Types of Storm Damage We Repair
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={typesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-text-secondary max-w-2xl mx-auto"
            >
              We're experts in identifying and repairing all types of storm damage to your home.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {damageTypes.map((type, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={typesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="bg-white rounded-2xl border border-border p-6 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-safety-orange/10 rounded-2xl flex items-center justify-center">
                  <type.icon className="w-8 h-8 text-safety-orange" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{type.title}</h3>
                <p className="text-text-secondary text-sm">{type.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProcessTimeline />

      {/* Trust Section */}
      <section className="py-20 lg:py-28" ref={trustRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={trustInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy mb-4">
                Why Homeowners Trust Us for Insurance Claims
              </h2>
              <p className="text-text-secondary mb-8">
                Dealing with storm damage is stressful. Dealing with insurance companies can be even
                worse. That's why we handle the heavy lifting for you.
              </p>

              <ul className="space-y-4 mb-8">
                {trustPoints.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy">{point.title}</strong>
                      <p className="text-sm text-text-secondary mt-0.5">{point.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Button variant="primary" href="/contact">
                Schedule Free Inspection
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={trustInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface rounded-2xl border border-border p-6 lg:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-safety-orange" />
                <h3 className="text-lg font-bold text-navy">Signs You May Have Storm Damage</h3>
              </div>
              <ul className="space-y-3">
                {damageSignsList.map((sign, i) => (
                  <li
                    key={i}
                    className="pb-3 border-b border-border last:border-0 text-sm text-text-secondary"
                  >
                    {sign}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-text-secondary mt-4">
                <strong>Important:</strong> Storm damage isn't always visible from the ground. A
                professional inspection is the only way to know for sure.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <FAQ title="Storm Damage & Insurance FAQs" items={faqs} />
      <CTA />
    </>
  )
}
