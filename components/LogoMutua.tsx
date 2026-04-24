'use client'

export default function LogoMutua({ className = '', variant = 'dark' }: { className?: string, variant?: 'dark' | 'light' }) {
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#003087'
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg width="250" height="32" viewBox="0 0 250 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* MUTUA - Extra Bold */}
        <text x="0" y="26" fill={primaryColor} font-family="'Open Sans', sans-serif" font-weight="800" font-size="26" letter-spacing="-1">MUTUA</text>
        
        {/* MADRILEÑA - Light */}
        <text x="92" y="26" fill={primaryColor} font-family="'Open Sans', sans-serif" font-weight="300" font-size="26" letter-spacing="0.5">MADRILEÑA</text>
        
        {/* Tilde de la Ñ integrada */}
        <path d="M211 6C213 4.5 216 4.5 218 6" stroke={primaryColor} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
