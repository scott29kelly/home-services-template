import type { ReactNode } from 'react'
import { m } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <m.div
      whileHover={hover ? { y: -8 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {children}
    </m.div>
  )
}
