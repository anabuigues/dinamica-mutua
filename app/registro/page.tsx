'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { generarIdentificador, generarPassword } from '@/lib/utils/generateCredentials'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import bcrypt from 'bcryptjs'


export default function RegistroPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ nombre?: string; general?: string }>({})

  function validar() {
    const newErrors: typeof errors = {}
    if (!nombre.trim() || nombre.trim().length < 2) {
      newErrors.nombre = 'Introduce tu nombre completo (mínimo 2 caracteres)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    setErrors({})

    try {
      // Generar credenciales
      const identificador = generarIdentificador()
      const passwordPlano = generarPassword()
      const passwordHash = await bcrypt.hash(passwordPlano, 10)

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: nombre.trim(),
          identificador,
          password_hash: passwordHash,
          rol: 'participante',
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error Supabase:', error)
        setErrors({ general: 'Error al crear el usuario. Inténtalo de nuevo.' })
        return
      }



      // Redirigir a confirmación con los datos
      const params = new URLSearchParams({
        id: identificador,
        pwd: passwordPlano,
        nombre: nombre.trim(),
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
          <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <span className="text-white font-display uppercase text-sm tracking-wider group-hover:text-brand-pink transition-colors">
            Dinámica Mutua
          </span>
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
            <span className="badge bg-brand-pink/10 text-brand-pink">Nuevo registro</span>
            <span className="text-neutral-400 text-sm font-body">Paso 1 de 1</span>
          </div>

          <h1 className="font-display text-brand-blue-dark text-3xl uppercase mb-2">
            Crea tu perfil
          </h1>
          <p className="text-neutral-600 font-body text-sm mb-8">
            Solo necesitamos tu nombre. No se requiere correo ni contraseña propia.
          </p>

          <Card>
            <CardBody className="space-y-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Input
                  id="nombre"
                  label="Nombre completo"
                  placeholder="Ej: María García López"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  error={errors.nombre}
                  autoComplete="name"
                  autoFocus
                />


                {errors.general && (
                  <div className="bg-semantic-error/10 border border-semantic-error/30 rounded-md px-4 py-3">
                    <p className="text-sm text-semantic-error font-body">{errors.general}</p>
                  </div>
                )}

                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-neutral-600 font-body leading-relaxed">
                    <strong className="text-neutral-800">¿Qué ocurre a continuación?</strong><br />
                    El sistema generará automáticamente un identificador único y una contraseña.
                    Guárdalos para poder acceder más adelante.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  id="btn-submit-registro"
                >
                  Crear mi perfil
                </Button>
              </form>
            </CardBody>
          </Card>

          <p className="text-center text-xs text-neutral-400 font-body mt-6">
            Dinámica organizativa interna — Mutua Madrileña 2026
          </p>
        </div>
      </div>
    </main>
  )
}
