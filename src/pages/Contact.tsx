import { useState } from 'react'
import { m } from 'framer-motion'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import ContactForm from '../components/forms/ContactForm'
import BookingForm from '../components/forms/BookingForm'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'
import { features } from '../config/features'

const faqs = [
  {
    question: 'Is the inspection really free?',
    answer:
      'Yes, 100% free with no obligation. We believe in earning your trust through honest assessments.',
  },
  {
    question: 'How quickly can you come out?',
    answer:
      'Usually 1-3 business days. For storm emergencies, we offer same or next-day inspections.',
  },
  {
    question: 'Do I need to be home?',
    answer:
      "It's helpful but not required. We can perform an exterior inspection and follow up with a call to discuss our findings.",
  },
  {
    question: 'What areas do you serve?',
    answer:
      'We serve the greater metro area and surrounding communities. Visit our Service Areas page for a full list of locations.',
  },
]

type TabKey = 'message' | 'booking'

const tabs: { key: TabKey; label: string; id: string }[] = [
  { key: 'message', label: 'Send a Message', id: 'tab-message' },
  { key: 'booking', label: 'Schedule Inspection', id: 'tab-booking' },
]

export default function Contact() {
  const { ref, isInView } = useScrollReveal()
  const [activeTab, setActiveTab] = useState<TabKey>('message')

  const showTabs = features.onlineBooking

  /** Handle keyboard navigation between tabs (arrow keys per ARIA tab pattern). */
  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx: number | null = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIdx = (idx + 1) % tabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIdx = (idx - 1 + tabs.length) % tabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIdx = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIdx = tabs.length - 1
    }
    if (nextIdx !== null) {
      setActiveTab(tabs[nextIdx].key)
      // Focus the newly activated tab button
      const btn = document.getElementById(tabs[nextIdx].id)
      btn?.focus()
    }
  }

  return (
    <>
      <PageMeta title="Contact Us" description={`Schedule your free roof or siding inspection. Call ${SITE.phone} or fill out our contact form.`} path="/contact" />
      <Hero
        backgroundImage="/images/contact-hero.webp"
        headline="Get In"
        highlightText="Touch"
        subhead={
          showTabs
            ? 'Schedule your free inspection or send us a message. We\'re here to help.'
            : 'Schedule your free inspection or ask us anything. We\'re here to help.'
        }
        compact
      />

      <section className="py-20 lg:py-28" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form area with optional tab UI */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {showTabs ? (
                <>
                  {/* Tab bar */}
                  <div role="tablist" aria-label="Contact method" className="flex border-b border-border mb-8">
                    {tabs.map((tab, idx) => {
                      const isActive = activeTab === tab.key
                      return (
                        <button
                          key={tab.key}
                          id={tab.id}
                          role="tab"
                          type="button"
                          aria-selected={isActive}
                          aria-controls={`panel-${tab.key}`}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => setActiveTab(tab.key)}
                          onKeyDown={(e) => handleTabKeyDown(e, idx)}
                          className={[
                            'px-4 py-3 text-sm font-medium transition-all -mb-px',
                            isActive
                              ? 'border-b-2 border-brand-blue text-brand-blue font-semibold'
                              : 'text-text-secondary hover:text-navy',
                          ].join(' ')}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Tab panels */}
                  <div
                    id="panel-message"
                    role="tabpanel"
                    aria-labelledby="tab-message"
                    hidden={activeTab !== 'message'}
                  >
                    {activeTab === 'message' && <ContactForm />}
                  </div>
                  <div
                    id="panel-booking"
                    role="tabpanel"
                    aria-labelledby="tab-booking"
                    hidden={activeTab !== 'booking'}
                  >
                    {activeTab === 'booking' && <BookingForm />}
                  </div>
                </>
              ) : (
                <ContactForm />
              )}
            </m.div>

            {/* Contact Info Sidebar */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-surface rounded-2xl border border-border p-6">
                <h3 className="font-bold text-navy mb-4">Contact Information</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy">Call Us</p>
                      <a href={`tel:${SITE.phone}`} className="text-sm text-brand-blue hover:underline">
                        {SITE.phone}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy">Email Us</p>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="text-sm text-brand-blue hover:underline"
                      >
                        {SITE.email}
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy">Office</p>
                      <p className="text-sm text-text-secondary">
                        {SITE.address.street}
                        <br />
                        {SITE.address.city}, {SITE.address.state} {SITE.address.zip}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-navy">Office Hours</p>
                      <p className="text-sm text-text-secondary">
                        {SITE.hours.weekday}
                        <br />
                        {SITE.hours.saturday}
                        <br />
                        {SITE.hours.sunday}
                      </p>
                      <p className="text-xs text-safety-orange font-medium mt-1">
                        {SITE.hours.emergency}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </m.div>
          </div>
        </div>
      </section>

      <FAQ title="Contact FAQs" items={faqs} />
    </>
  )
}
