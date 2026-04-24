'use client'

import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { guardarSesion } from '@/lib/session'
import Button from '@/components/ui/Button'
import Card, { CardBody, CardHeader } from '@/components/ui/Card'

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      id={`btn-copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex items-center gap-1.5 text-xs font-body text-brand-blue-mid hover:text-brand-blue-dark transition-colors mt-2"
      type="button"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          ¡Copiado!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          Copiar {label}
        </>
      )}
    </button>
  )
}

function CopyAllButton({ identificador, password }: { identificador: string; password: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const texto = `Dinámica Mutua — Mis credenciales\nIdentificador: ${identificador}\nContraseña: ${password}`
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const el = document.createElement('textarea')
      el.value = texto
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      onClick={handleCopy}
      id="btn-copy-all"
      className="w-full flex items-center justify-center gap-2 border-2 border-brand-blue-mid text-brand-blue-mid hover:bg-brand-blue-mid hover:text-white font-semibold px-4 py-2.5 rounded-md transition-all duration-200 text-sm font-body"
      type="button"
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ¡Copiado al portapapeles!
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
          Copiar identificador y contraseña
        </>
      )}
    </button>
  )
}

function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const identificador = searchParams.get('id') || ''
  const password = searchParams.get('pwd') || ''
  const nombre = searchParams.get('nombre') || ''

  const [sessionSaved, setSessionSaved] = useState(false)

  const saveSession = useCallback(() => {
    const uid = searchParams.get('uid') || ''
    if (identificador && nombre && uid && !sessionSaved) {
      guardarSesion({ id: uid, nombre, identificador, rol: 'participante' })
      setSessionSaved(true)
    }
  }, [identificador, nombre, sessionSaved, searchParams])

  useEffect(() => {
    if (!identificador || !password) {
      router.replace('/')
      return
    }
    saveSession()
  }, [identificador, password, router, saveSession])

  if (!identificador || !password) return null

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Éxito */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-semantic-success/15 border-2 border-semantic-success/30 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#28A745">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        </div>

        <h1 className="font-display text-brand-blue-dark text-3xl uppercase text-center mb-2">
          ¡Registro completado!
        </h1>
        <p className="text-neutral-600 font-body text-sm text-center mb-8">
          Hola <strong className="text-neutral-800">{nombre}</strong>, tu perfil ha sido creado.
          <br />Anota estos datos — los necesitarás para volver a acceder.
        </p>

        {/* Aviso importante */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFC107" className="flex-shrink-0 mt-0.5">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <p className="text-sm text-amber-800 font-body leading-relaxed">
            <strong>¡Importante!</strong> Anota o copia estas credenciales ahora.
            La contraseña no se puede recuperar después.
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader blue>
            <h2 className="font-display text-white text-sm uppercase tracking-wider">
              Tus credenciales de acceso
            </h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Identificador */}
            <div>
              <p className="form-label text-neutral-600 text-xs uppercase tracking-wider mb-2">
                Identificador
              </p>
              <div className="credential-box text-3xl" id="credential-identificador">
                {identificador}
              </div>
              <CopyButton text={identificador} label="identificador" />
            </div>

            {/* Contraseña */}
            <div>
              <p className="form-label text-neutral-600 text-xs uppercase tracking-wider mb-2">
                Contraseña
              </p>
              <div className="credential-box text-2xl" id="credential-password">
                {password}
              </div>
              <CopyButton text={password} label="contraseña" />
            </div>

            {/* Copiar todo */}
            <CopyAllButton identificador={identificador} password={password} />
          </CardBody>
        </Card>

        {/* Info área */}
        <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-lg px-4 py-3 mb-8">
          <div className="w-8 h-8 rounded-full bg-brand-blue-dark/10 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#003087">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-neutral-500 font-body">Registrado como</p>
            <p className="text-sm font-semibold text-neutral-800 font-body">
              {nombre}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          id="btn-ir-a-canvas"
          onClick={() => router.push('/modelo')}
        >
          Ir al modelo organizativo →
        </Button>

        <p className="text-center text-xs text-neutral-400 font-body mt-4">
          También puedes acceder más tarde desde la{' '}
          <Link href="/" className="text-brand-blue-mid hover:underline">
            página de inicio
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="bg-brand-blue-dark py-4 px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <span className="text-white font-display uppercase text-sm tracking-wider">Dinámica Mutua</span>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue-mid border-t-transparent rounded-full" />
        </div>
      }>
        <ConfirmacionContent />
      </Suspense>
    </main>
  )
}
