import { CheckCircle, Phone, Mail, Clock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Hero from '../components/sections/Hero'
import PageMeta from '../components/ui/PageMeta'
import { SITE } from '../config/site'
import { forms } from '../config/forms'

const { thankYou } = forms

export default function ThankYou() {
  return (
    <>
      <PageMeta
        title="Thank You"
        description="Your request has been received. We'll be in touch within 24 hours."
        path="/thank-you"
        noindex
      />

      <Hero
        backgroundImage="/images/contact-hero.webp"
        headline="Request"
        highlightText="Received"
        subhead="Thank you for reaching out. Here's what happens next."
        compact
      />

      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-surface rounded-2xl border border-border p-8 sm:p-12 text-center">
            {/* Success icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-3">
              {thankYou.heading}
            </h1>
            <p className="text-lg text-text-secondary mb-10">
              {thankYou.subheading}
            </p>

            {/* Next Steps */}
            <div className="text-left max-w-md mx-auto mb-10">
              <h2 className="text-lg font-semibold text-navy mb-4">What Happens Next</h2>
              <ol className="space-y-4">
                {thankYou.nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-brand-blue text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <p className="text-text-secondary pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact info */}
            <div className="border-t border-border pt-8 space-y-4">
              <h2 className="text-lg font-semibold text-navy mb-4">Need Immediate Help?</h2>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a
                  href={`tel:${SITE.phone}`}
                  className="inline-flex items-center gap-2 text-brand-blue hover:underline font-medium"
                >
                  <Phone className="w-5 h-5" />
                  {SITE.phone}
                </a>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-2 text-brand-blue hover:underline font-medium"
                >
                  <Mail className="w-5 h-5" />
                  {SITE.email}
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mt-4">
                <Clock className="w-4 h-4" />
                <span>
                  {SITE.hours.weekday} | {SITE.hours.saturday}
                </span>
              </div>
              <p className="text-xs text-safety-orange font-medium">
                {SITE.hours.emergency}
              </p>
            </div>

            {/* Back to home */}
            <div className="mt-10">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-safety-orange to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
