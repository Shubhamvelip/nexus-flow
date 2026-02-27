'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BaseButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function BaseButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button'
}: BaseButtonProps) {
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-base'
  }

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
  }

  const baseClasses = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const renderIcon = () => {
    if (loading) {
      return (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )
    }
    return icon
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{renderIcon()}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{renderIcon()}</span>
      )}
    </button>
  )
}

interface StatusBadgeProps {
  children: ReactNode
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({
  children,
  status,
  size = 'md',
  className
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  }

  const statusClasses = {
    success: 'bg-green-600 text-white border-green-600',
    warning: 'bg-yellow-600 text-white border-yellow-600',
    error: 'bg-red-600 text-white border-red-600',
    info: 'bg-blue-600 text-white border-blue-600',
    default: 'bg-secondary text-secondary-foreground border-secondary'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        sizeClasses[size],
        statusClasses[status],
        className
      )}
    >
      {children}
    </span>
  )
}

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md'
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2'
  }

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('relative overflow-hidden rounded-full bg-secondary', sizeClasses[size])}>
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
