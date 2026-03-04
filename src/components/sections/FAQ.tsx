import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import SectionHeading from '../ui/SectionHeading'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  title: string
  items: FAQItem[]
}

export default function FAQ({ title, items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { ref, isInView } = useScrollReveal()

  return (
    <section className="py-20 lg:py-28 bg-surface" ref={ref as React.RefObject<HTMLElement>}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading title={title} className="mb-10" />

        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className={`scroll-reveal ${isInView ? 'in-view' : ''} bg-white rounded-xl border border-border overflow-hidden`}
              style={{ transitionDelay: `${0.1 + i * 0.05}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-navy font-semibold hover:bg-surface transition-colors"
              >
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-navy/40 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                className={`accordion-content ${openIndex === i ? 'open' : ''}`}
              >
                <div>
                  <div className="px-6 pb-4 text-text-secondary leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
