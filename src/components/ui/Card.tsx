import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`${hover ? 'hover-lift' : ''} bg-white rounded-2xl border border-border shadow-sm hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  )
}
