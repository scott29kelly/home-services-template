import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'outline-white' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  href?: string
  external?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-safety-orange to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105',
  secondary:
    'bg-navy text-white hover:bg-navy/90',
  outline:
    'border-2 border-navy/20 text-navy hover:border-navy hover:bg-navy hover:text-white',
  'outline-white':
    'border-2 border-white/30 text-white hover:bg-white hover:text-navy',
  ghost:
    'text-navy/70 hover:text-navy hover:bg-slate-100',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  external,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  if (href && external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
