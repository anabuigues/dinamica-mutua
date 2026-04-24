'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoMutua from '@/components/LogoMutua'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'

export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string; general?: string }>({})

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (nombre.trim().length < 3) {
      setErrors({ nombre: 'El nombre debe tener al menos 3 caracteres.' })
      return
    }

    setLoading(true)

    try {
      // Generar identificador de exactamente 9 caracteres para cumplir con char(9)
      // Formato: M-XXXX-XX (Ej: M-1234-56)
      const part1 = Math.floor(1000 + Math.random() * 9000)
      const part2 = Math.floor(10 + Math.random() * 90)
      const identificador = `M-${part1}-${part2}`
      const passwordPlano = Math.random().toString(36).slice(-8)

      // 1. Crear el usuario en Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: nombre.trim(),
          identificador,
          password_hash: passwordPlano, // En un entorno real se hashearía
          rol: 'participante',
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error Supabase:', error)
        setErrors({ general: `Error: ${error.message || 'Error al crear el usuario'}` })
        return
      }

      // Redirigir a confirmación con los datos
      const params = new URLSearchParams({
        id: identificador,
        pwd: passwordPlano,
        nombre: nombre.trim(),
        uid: data.id,
      })
      router.push(`/registro/confirmacion?${params.toString()}`)
    } catch (err) {
      console.error('Error inesperado:', err)
      setErrors({ general: 'Error inesperado. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header mínimo */}
      <header className="bg-brand-blue-dark py-4 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <LogoMutua />
        </Link>
        <Link href="/login" className="text-white/70 hover:text-white text-sm font-body transition-colors">
          ¿Ya tienes identificador? →
        </Link>
      </header>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          {/* Paso */}
          <div className="flex items-center gap-2 mb-6">
            <span className="w-6 h-6 rounded-full bg-brand-blue-mid text-white text-[10px] font-bold flex items-center justify-center">1</span>
            <span className="text-xs font-body font-bold text-brand-blue-dark uppercase tracking-wider">Registro de participante</span>
          </div>

          <Card>
            <CardHeader className="bg-brand-blue-dark text-white border-b-0 py-6">
              <h1 className="font-display text-xl uppercase text-center">¡Únete a la dinámica!</h1>
            </CardHeader>
            <CardBody className="p-8">
              <form onSubmit={handleRegistro} className="space-y-6">
                <div>
                  <label className="block text-xs font-body font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Tu nombre completo
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Escribe tu nombre..."
                    required
                    autoFocus
                    className={`w-full px-4 py-3 bg-neutral-50 border ${
                      errors.nombre ? 'border-semantic-error' : 'border-neutral-200'
                    } rounded-lg focus:ring-2 focus:ring-brand-blue-mid focus:border-brand-blue-mid outline-none transition-all font-body text-sm`}
                  />
                  {errors.nombre && <p className="text-[11px] text-semantic-error mt-1 font-body">{errors.nombre}</p>}
                  <p className="text-[11px] text-neutral-400 mt-2 font-body italic leading-relaxed">
                    * Usaremos tu nombre para identificar tus aportaciones en el canvas del equipo.
                  </p>
                </div>

                {errors.general && (
                  <div className="bg-semantic-error/10 border border-semantic-error/30 rounded-md px-4 py-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#DC3545">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p className="text-sm text-semantic-error font-body">{errors.general}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  id="btn-continuar-registro"
                >
                  Continuar →
                </Button>
              </form>
            </CardBody>
          </Card>

          <div className="mt-8 bg-brand-blue-mid/5 rounded-xl p-5 border border-brand-blue-mid/10">
            <h3 className="text-xs font-display text-brand-blue-dark uppercase font-bold mb-2">Información importante</h3>
            <p className="text-[11px] text-neutral-500 font-body leading-relaxed">
              Al registrarte, el sistema generará un **Identificador único** y una **Contraseña** para ti.
              Asegúrate de guardarlos en el siguiente paso para poder volver a acceder a tu canvas más tarde.
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-neutral-50 py-4 text-center border-t border-neutral-200">
        <p className="text-neutral-400 text-[10px] font-body uppercase tracking-widest">
          Dinámica organizativa interna — Mutua Madrileña 2026
        </p>
      </footer>
    </main>
  )
}
