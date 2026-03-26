import { Link } from 'react-router'
import { MapPin, Star } from 'lucide-react'
import type { Testimonial } from '../../config/testimonials'

interface TestimonialCardProps {
  testimonial: Testimonial
  showProjectLink?: boolean
}

export default function TestimonialCard({
  testimonial,
  showProjectLink = true,
}: TestimonialCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: testimonial.rating ?? 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-safety-orange text-safety-orange" />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {testimonial.source && (
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-navy">
            {testimonial.source}
          </span>
        )}
        {testimonial.reviewDate && (
          <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text-secondary">
            {testimonial.reviewDate}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">&ldquo;{testimonial.quote}&rdquo;</p>

      {testimonial.highlights && testimonial.highlights.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {testimonial.highlights.map((highlight) => (
            <span
              key={highlight}
              className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-brand-blue"
            >
              {highlight}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold text-navy">{testimonial.name}</p>
          <p className="flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5" />
            <span>{testimonial.location}</span>
            {testimonial.service && <span>&middot; {testimonial.service}</span>}
          </p>
        </div>
      </div>

      {showProjectLink && testimonial.projectSlug && (
        <div className="mt-4">
          <Link
            to={`/portfolio/${testimonial.projectSlug}`}
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            View related case study
          </Link>
        </div>
      )}
    </article>
  )
}
