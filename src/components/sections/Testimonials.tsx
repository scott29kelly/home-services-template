import SectionHeading from '../ui/SectionHeading'
import AnimatedTestimonials from '../ui/AnimatedTestimonials'
import Button from '../ui/Button'
import { testimonials } from '../../config/testimonials'

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          title="What Our Customers Say"
          subtitle="Don't just take our word for it -- hear from homeowners we've helped."
          theme="dark"
          className="mb-14"
        />

        <AnimatedTestimonials
          testimonials={testimonials.featured}
          autoplay
          interval={5000}
        />

        {/* Rating badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 pt-10 border-t border-white/10">
          {testimonials.ratingBadges.map((badge, i) => (
            <div key={i} className="text-center">
              <p className="font-bold text-white text-sm">{badge.label}</p>
              <p className="text-xs text-white/50">{badge.sublabel}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline-white" href="/testimonials">
            Read More Reviews
          </Button>
        </div>
      </div>
    </section>
  )
}
