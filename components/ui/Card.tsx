'use client'

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  as?: 'div' | 'article' | 'section'
}

export default function Card({
  children,
  className = '',
  hover = false,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={`card ${hover ? 'transition-shadow duration-200 hover:shadow-md cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  blue?: boolean
}

export function CardHeader({ children, className = '', blue = false }: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-5 rounded-t-xl ${blue ? 'bg-brand-blue-dark' : 'border-b border-neutral-200'} ${className}`}
    >
      {children}
    </div>
  )
}

interface CardBodyProps {
  children: React.ReactNode
  className?: string
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>
}
