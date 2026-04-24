'use client'

export default function LogoMutua({ className = '', variant = 'dark' }: { className?: string, variant?: 'dark' | 'light' }) {
  const primaryColor = variant === 'light' ? '#FFFFFF' : '#003087'
  const archColor = variant === 'light' ? 'rgba(255,255,255,0.3)' : '#3DA1D9'
  
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <svg width="220" height="50" viewBox="0 0 220 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Arco/Domo característico */}
        <path d="M5 40V22C5 13.7157 11.7157 7 20 7C28.2843 7 35 13.7157 35 22V40H5Z" fill={archColor}/>
        
        {/* Letras MM */}
        <text x="3" y="36" fill={primaryColor} font-family="Arial, sans-serif" font-weight="900" font-size="20" letter-spacing="-1.5">MM</text>
        
        {/* Texto MUTUA */}
        <text x="42" y="36" fill={primaryColor} font-family="Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="-0.5">MUTUA</text>
        
        {/* Texto MADRILEÑA */}
        <text x="120" y="36" fill={primaryColor} font-family="Arial, sans-serif" font-weight="300" font-size="22" letter-spacing="0.5">MADRILEÑA</text>
        
        {/* Tilde de la Ñ */}
        <path d="M195 15C196.5 13.5 198.5 13.5 200 15" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
