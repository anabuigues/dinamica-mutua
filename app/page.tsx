'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tieneSesionActiva } from '@/lib/session'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // HU-02: Si hay sesión activa, redirigir directamente al canvas
    if (tieneSesionActiva()) {
      router.replace('/canvas')
    }
  }, [router])

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="hero-section flex-1 flex flex-col items-center justify-center">
        <div className="max-w-2xl mx-auto animate-slide-up">
          {/* Logo / Brand */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="text-white/70 text-sm font-body tracking-widest uppercase">Mutua Madrileña</span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-white text-4xl md:text-5xl font-bold uppercase text-center mb-4 leading-tight">
            Dinámica<br />
            <span className="text-brand-pink">Mutua</span>
          </h1>

          <p className="text-white/85 text-center text-base font-body mb-12 max-w-md mx-auto leading-relaxed">
            Comparte tu visión sobre el nuevo modelo organizativo.
            Cumplimenta tu canvas y descubre el de tus compañeros.
          </p>

          {/* Dos opciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Nuevo registro */}
            <Link
              href="/registro"
              id="btn-nuevo-registro"
              className="group flex flex-col items-center bg-brand-pink hover:bg-brand-pink-hover text-white rounded-xl px-6 py-8 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  <path d="M19 7h-2v2h-2v2h2v2h2v-2h2V9h-2z"/>
                </svg>
              </div>
              <span className="font-display text-lg uppercase font-bold mb-1">Nuevo registro</span>
              <span className="text-white/80 text-sm font-body">Es mi primera vez en la dinámica</span>
            </Link>

            {/* Ya tengo identificador */}
            <Link
              href="/login"
              id="btn-tengo-identificador"
              className="group flex flex-col items-center bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white/60 text-white rounded-xl px-6 py-8 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 text-center backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <span className="font-display text-lg uppercase font-bold mb-1">Ya tengo identificador</span>
              <span className="text-white/80 text-sm font-body">Accede con tus credenciales</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-blue-dark/95 py-4 text-center">
        <p className="text-white/40 text-xs font-body">
          © 2026 Mutua Madrileña — Dinámica organizativa interna
        </p>
      </footer>
    </main>
  )
}
