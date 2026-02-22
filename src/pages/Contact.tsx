import { useState } from 'react'
import { m } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react'
import Hero from '../components/sections/Hero'
import FAQ from '../components/sections/FAQ'
import { useScrollReveal } from '../hooks/useScrollReveal'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'

const serviceOptions = [
  'Free Roof Inspection',
  'Roof Replacement',
  'Roof Repair',
  'Siding Installation/Repair',
  'Storm Damage Assessment',
  'Insurance Claim Help',
  'Other',
]

const referralOptions = [
  'Google Search',
  'Facebook',
  'Friend/Family Referral',
  'Saw work in neighborhood',
  'Door knock',
  'Other',
]

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

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const { ref, isInView } = useScrollReveal()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <PageMeta title="Contact Us" description={`Schedule your free roof or siding inspection. Call ${SITE.phone} or fill out our contact form.`} path="/contact" />
      <Hero
        backgroundImage="/images/contact-hero.webp"
        headline="Get In"
        highlightText="Touch"
        subhead="Schedule your free inspection or ask us anything. We're here to help."
        compact
      />

      <section className="py-20 lg:py-28" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Thank You!</h3>
                  <p className="text-text-secondary">
                    We've received your message and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-2xl font-bold text-navy mb-2">Request Free Inspection</h2>
                  <p className="text-text-secondary mb-6">
                    Fill out the form below and we'll contact you within 24 hours.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                        placeholder="(555) 555-5555"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Property Address *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                      placeholder="Street address, City, State, ZIP"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">Service Needed *</label>
                      <select
                        required
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
                      >
                        <option value="">Select a service...</option>
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-1">How did you hear about us?</label>
                      <select className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all">
                        <option value="">Select...</option>
                        {referralOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-1">Additional Details</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all resize-none"
                      placeholder="Tell us about your situation..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
                  >
                    Submit Request
                  </button>
                </form>
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
