'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LogoMutua from '@/components/LogoMutua'
import { supabase } from '@/lib/supabase'
import { guardarSesion, tieneSesionActiva } from '@/lib/session'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'
import bcrypt from 'bcryptjs'

export default function LoginPage() {
  const router = useRouter()
  const [identificador, setIdentificador] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ general?: string }>({})

  useEffect(() => {
    if (tieneSesionActiva()) {
      router.replace('/modelo')
    }
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Buscar usuario por identificador
      const { data: u, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('identificador', identificador.trim().toUpperCase())
        .single()

      if (error || !u) {
        setErrors({ general: 'Identificador o contraseña incorrectos.' })
        return
      }

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
          <LogoMutua />
        </Link>
        <Link href="/registro" className="text-white/70 hover:text-white text-sm font-body transition-colors">
          ¿Primera vez? Regístrate →
        </Link>
      </header>

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <Card>
            <CardHeader className="bg-brand-blue-dark text-white border-b-0 py-6">
              <h1 className="font-display text-xl uppercase text-center">Acceso al Canvas</h1>
            </CardHeader>
            <CardBody className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-body font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Tu ID de acceso
                  </label>
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Ej: MUTUA-1234"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-blue-mid focus:border-brand-blue-mid outline-none transition-all font-body text-sm"
                  />
                </div>

                <div className="relative">
                  <label className="block text-xs font-body font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Tu contraseña
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-blue-mid focus:border-brand-blue-mid outline-none transition-all font-body text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-neutral-400 hover:text-brand-blue-mid transition-colors"
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

      <footer className="bg-neutral-50 py-4 text-center border-t border-neutral-200">
        <p className="text-neutral-400 text-[10px] font-body uppercase tracking-widest">
          Dinámica organizativa interna — Offsite 27 de Abril
        </p>
      </footer>
    </main>
  )
}
