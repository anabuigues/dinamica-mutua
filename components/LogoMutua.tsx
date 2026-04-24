'use client'

export default function LogoMutua({ className = '', variant = 'dark' }: { className?: string, variant?: 'dark' | 'light' }) {
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#003087'
  const archColor = variant === 'light' ? 'rgba(255,255,255,0.25)' : '#4AB2E5'
  
  return (
    <div className={`flex items-center ${className}`}>
      <svg width="280" height="60" viewBox="0 0 280 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Arco MM Estilizado */}
        <path d="M8 48V20C8 10.0589 16.0589 2 26 2C35.9411 2 44 10.0589 44 20V48H8Z" fill={archColor}/>
        
        {/* Dibujo de las MM */}
        <path d="M14 42H19V29L22 36H23L26 29V42H31V23H26L22.5 31L19 23H14V42Z" fill={variant === 'light' ? '#FFFFFF' : '#003087'}/>
        <path d="M33 42H38V29L41 36H42L45 29V42H50V23H45L41.5 31L38 23H33V42Z" fill={variant === 'light' ? '#FFFFFF' : '#003087'} className="hidden"/>
        
        {/* Texto MUTUA */}
        <text x="55" y="42" fill={primaryColor} font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="32" letter-spacing="-1.5">MUTUA</text>
        
        {/* Texto MADRILEÑA */}
        <text x="165" y="42" fill={primaryColor} font-family="system-ui, -apple-system, sans-serif" font-weight="300" font-size="32" letter-spacing="-0.5">MADRILEÑA</text>
        
        {/* Tilde de la Ñ mejorada */}
        <path d="M248 14C250 12 254 12 256 14" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
