'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'success' | 'ghost' | 'danger'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  fullWidth?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[--color-navy] text-white active:bg-[--color-navy-light]',
  success: 'bg-[--color-success-bg] text-[--color-success]',
  ghost:   'bg-[--color-card-muted] text-[--color-text-secondary]',
  danger:  'bg-[--color-danger-bg] text-[--color-danger]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-2.5 text-[11px] gap-1.5 rounded-[--radius-md]',
  md: 'px-4    py-3   text-[12px] gap-2   rounded-[--radius-lg]',
  lg: 'px-4    py-4   text-[13px] gap-2.5 rounded-[--radius-xl]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold border-none',
        'transition-all duration-100 active:scale-[0.97]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-navy]/40',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      style={{ fontFamily: 'var(--font-label)' }}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
