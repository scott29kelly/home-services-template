import { useScrollReveal } from '../../hooks/useScrollReveal'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  as?: 'h1' | 'h2' | 'h3'
  theme?: 'dark' | 'light'
  animated?: boolean
  className?: string
}

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  as: Tag = 'h2',
  theme = 'light',
  animated = true,
  className = '',
}: SectionHeadingProps) {
  const isCenter = align === 'center'
  const isDark = theme === 'dark'

  const titleColor = isDark ? 'text-white' : 'text-navy'
  const subtitleColor = isDark ? 'text-white/80' : 'text-slate-600'
  const accentColor = isDark
    ? 'bg-gradient-to-r from-safety-orange to-orange-400'
    : 'bg-gradient-to-r from-brand-blue to-sky-400'

  const wrapperClasses = [
    isCenter ? 'text-center' : 'text-left',
    className,
  ].filter(Boolean).join(' ')

  const titleClasses = [
    'text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4',
    titleColor,
  ].join(' ')

  const subtitleClasses = [
    'text-lg max-w-2xl',
    subtitleColor,
    isCenter ? 'mx-auto' : '',
  ].filter(Boolean).join(' ')

  const { ref, isInView } = useScrollReveal()

  if (!animated) {
    return (
      <div className={wrapperClasses}>
        {/* Accent line */}
        <div
          className={`h-1 w-10 rounded-full mb-5 ${accentColor} ${isCenter ? 'mx-auto' : ''}`}
        />
        <Tag className={titleClasses}>{title}</Tag>
        {subtitle && <p className={subtitleClasses}>{subtitle}</p>}
      </div>
    )
  }

  return (
    <div className={wrapperClasses} ref={ref as React.RefObject<HTMLDivElement>}>
      {/* Accent line */}
      <div
        className={`scroll-reveal ${isInView ? 'in-view' : ''} h-1 w-10 rounded-full mb-5 ${accentColor} ${isCenter ? 'mx-auto' : ''}`}
      />
      <div className={`scroll-reveal ${isInView ? 'in-view' : ''}`}>
        <Tag className={titleClasses}>{title}</Tag>
      </div>
      {subtitle && (
        <p className={`scroll-reveal delay-1 ${isInView ? 'in-view' : ''} ${subtitleClasses}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
