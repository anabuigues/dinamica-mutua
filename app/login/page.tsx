'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { guardarSesion, tieneSesionActiva } from '@/lib/session'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import bcrypt from 'bcryptjs'
import type { Usuario } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    identificador?: string
    password?: string
    general?: string
  }>({})

  useEffect(() => {
    if (tieneSesionActiva()) {
      router.replace('/modelo')
    }
  }, [router])

  // Formatear identificador automáticamente con guión
  function handleIdentificadorChange(value: string) {
    // Eliminar caracteres no válidos y forzar mayúsculas
    let clean = value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
    // Insertar guión automáticamente después del 4º carácter
    if (clean.length > 4 && !clean.includes('-')) {
      clean = clean.slice(0, 4) + '-' + clean.slice(4)
    }
    // Limitar a 9 chars (XXXX-XXXX)
    if (clean.length > 9) clean = clean.slice(0, 9)
    setIdentificador(clean)
  }

  function validar() {
    const newErrors: typeof errors = {}
    if (!identificador.trim()) {
      newErrors.identificador = 'Introduce tu identificador'
    } else if (identificador.replace('-', '').length < 8) {
      newErrors.identificador = 'El identificador tiene 8 caracteres (ej. A3K9-PZ2M)'
    }
    if (!password) {
      newErrors.password = 'Introduce tu contraseña'
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
      // Buscar usuario por identificador
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nombre, identificador, password_hash, rol')
        .eq('identificador', identificador.trim().toUpperCase())
        .single()

      if (error || !usuario) {
        setErrors({ general: 'Identificador o contraseña incorrectos.' })
        return
      }

      const u = usuario as Usuario

      // Verificar contraseña
      const passwordValida = await bcrypt.compare(password, u.password_hash)
      if (!passwordValida) {
        setErrors({ general: 'Identificador o contraseña incorrectos.' })
        return
      }

      // Guardar sesión
      guardarSesion({
        id: u.id,
        nombre: u.nombre,
        identificador: u.identificador,
        rol: u.rol,
      })

      // Redirigir según rol
      router.push(u.rol === 'superusuario' ? '/admin' : '/modelo')
    } catch (err) {
      console.error('Error en login:', err)
      setErrors({ general: 'Error inesperado. Inténtalo de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
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
        <Link href="/registro" className="text-white/70 hover:text-white text-sm font-body transition-colors">
          ¿Primera vez? Regístrate →
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-2 mb-6">
            <span className="badge bg-brand-blue-dark/10 text-brand-blue-dark">Acceso</span>
          </div>

          <h1 className="font-display text-brand-blue-dark text-3xl uppercase mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-neutral-600 font-body text-sm mb-8">
            Introduce tu identificador y contraseña para retomar tu canvas.
          </p>

          <Card>
            <CardHeader blue>
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <h2 className="font-display text-white text-sm uppercase tracking-wider">
                  Introduce tus credenciales
                </h2>
              </div>
            </CardHeader>

            <CardBody className="space-y-5">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <Input
                    id="identificador"
                    label="Identificador"
                    placeholder="Ej: A3K9-PZ2M"
                    value={identificador}
                    onChange={(e) => handleIdentificadorChange(e.target.value)}
                    error={errors.identificador}
                    autoComplete="username"
                    autoFocus
                    maxLength={9}
                    className="font-mono tracking-widest text-lg uppercase"
                    hint="8 caracteres con guión en el medio (ej. A3K9-PZ2M)"
                  />
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ej: cielo-84-mapa"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )}
                  </button>
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
                  id="btn-submit-login"
                >
                  Acceder a mi canvas
                </Button>
              </form>
            </CardBody>
          </Card>

          <p className="text-center text-xs text-neutral-400 font-body mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-brand-blue-mid hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
