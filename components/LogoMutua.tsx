'use client'

export default function LogoMutua({ className = '', variant = 'dark' }: { className?: string, variant?: 'dark' | 'light' }) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#003087]'
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="4" fill={variant === 'light' ? 'white' : '#003087'}/>
        <path d="M7 11V21H9.5V14.5L12.5 18L15.5 14.5V21H18V11H15.5L12.5 14.5L9.5 11H7Z" fill={variant === 'light' ? '#003087' : 'white'}/>
      </svg>
      <div className="flex flex-col">
        <span className={`font-display ${textColor} leading-none text-base font-bold tracking-tight`}>MUTUA</span>
        <span className={`font-display ${textColor} leading-none text-[10px] font-medium tracking-widest opacity-80`}>MADRILEÑA</span>
      </div>
    </div>
  )
}
