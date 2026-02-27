'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BaseCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

export function BaseCard({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick
}: BaseCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const variantClasses = {
    default: 'bg-card text-card-foreground border shadow-card',
    outlined: 'bg-card text-card-foreground border-2',
    elevated: 'bg-card text-card-foreground border shadow-card-hover'
  }

  const interactionClasses = cn(
    hover && 'hover:shadow-card-hover transition-shadow',
    clickable && 'cursor-pointer hover:bg-accent/50 transition-colors'
  )

  return (
    <div
      className={cn(
        'rounded-lg',
        variantClasses[variant],
        paddingClasses[padding],
        interactionClasses,
        className
      )}
      onClick={clickable ? onClick : undefined}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-6', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('pt-0', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center pt-6', className)}>
      {children}
    </div>
  )
}
