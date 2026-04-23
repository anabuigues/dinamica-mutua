'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import Link from 'next/link'

export default function CanvasPage() {
  const router = useRouter()
  const sesion = typeof window !== 'undefined' ? obtenerSesion() : null

  useEffect(() => {
    if (!obtenerSesion()) {
      router.replace('/')
    }
  }, [router])

  if (!sesion) return null

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200 shadow-sticky sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <span className="font-display text-brand-blue-dark uppercase text-sm tracking-wider">
              Dinámica Mutua
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-blue-dark/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#003087">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-800 font-body leading-none">{sesion.nombre}</p>
                <p className="text-xs text-neutral-500 font-body">{sesion.area}</p>
              </div>
            </div>
            <button
              onClick={() => { cerrarSesion(); router.push('/') }}
              className="text-xs text-neutral-500 hover:text-semantic-error transition-colors font-body"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido placeholder — se implementará en HU-03 */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-brand-blue-dark/10 flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#003087">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <h1 className="font-display text-brand-blue-dark text-2xl uppercase mb-3">
            Tu canvas
          </h1>
          <p className="text-neutral-600 font-body text-sm mb-2">
            ¡Bienvenido, <strong>{sesion.nombre}</strong>!
          </p>
          <p className="text-neutral-500 font-body text-sm mb-8">
            El canvas se implementará en la próxima historia (HU-03).
            Tu identificador es <code className="bg-neutral-100 px-2 py-0.5 rounded text-brand-blue-dark font-mono">{sesion.identificador}</code>
          </p>
          <div className="inline-flex items-center gap-2 bg-semantic-success/10 border border-semantic-success/30 rounded-lg px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#28A745">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-sm text-semantic-success font-body font-semibold">HU-01 y HU-02 completadas</span>
          </div>
        </div>
      </div>
    </main>
  )
}
