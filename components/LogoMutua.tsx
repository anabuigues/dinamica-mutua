'use client'

export default function LogoMutua({ className = '', variant = 'dark' }: { className?: string, variant?: 'dark' | 'light' }) {
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#003087'
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg width="280" height="32" viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Offsite - Extra Bold */}
        <text x="0" y="26" fill={primaryColor} font-family="'Open Sans', sans-serif" font-weight="800" font-size="26" letter-spacing="-1">OFFSITE</text>
        
        {/* 27 de Abril - Light */}
        <text x="110" y="26" fill={primaryColor} font-family="'Open Sans', sans-serif" font-weight="300" font-size="26" letter-spacing="0">27 de Abril</text>
      </svg>
    </div>
  )
}
