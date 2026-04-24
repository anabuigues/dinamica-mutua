'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { obtenerSesion, cerrarSesion } from '@/lib/session'
import type { SesionUsuario } from '@/types'

function Cell({
  id,
  titulo,
  descripcion,
  color,
  className = '',
  contribuciones = 0,
}: {
  id: string
  titulo: string
  descripcion?: string
  color: 'blue' | 'white'
  className?: string
  contribuciones?: number
}) {
  const isBlue = color === 'blue'
  return (
    <div
      className={`rounded-xl p-4 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 hover:shadow-md border ${
        isBlue
          ? 'bg-brand-blue-dark border-transparent text-white shadow-sm'
          : 'bg-white border-neutral-200 text-neutral-800 shadow-sm'
      } ${className}`}
    >
      <div>
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3
            className={`font-display uppercase ${
              isBlue ? 'text-white' : 'text-brand-blue-dark'
            } text-sm leading-tight`}
          >
            {titulo}
          </h3>
          {contribuciones > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-pink text-white text-xs font-bold">
              {contribuciones}
            </span>
          )}
        </div>
        {descripcion && (
          <p
            className={`text-xs font-body ${
              isBlue ? 'text-white/80' : 'text-neutral-500'
            } leading-relaxed`}
          >
            {descripcion}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2">
        <Link
          href={`/canvas/aportar?area=${id}`}
          className={`flex-1 flex justify-center items-center py-1.5 rounded-lg text-xs font-body font-semibold transition-colors ${
            isBlue
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-brand-blue-dark hover:bg-brand-blue-mid text-white'
          }`}
        >
          + Añadir
        </Link>
        <Link
          href={`/canvas/ver-area?area=${id}`}
          className={`flex-1 flex justify-center items-center py-1.5 rounded-lg text-xs font-body font-semibold border transition-colors ${
            isBlue
              ? 'border-white/30 hover:bg-white/10 text-white'
              : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
          }`}
        >
          Ver
        </Link>
      </div>
    </div>
  )
}

export default function ModeloOrganizativoPage() {
  const router = useRouter()
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)

  useEffect(() => {
    const s = obtenerSesion()
    if (!s) {
      router.replace('/')
      return
    }
    setSesion(s)
  }, [router])

  if (!sesion) return null

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-pink flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="font-display text-brand-blue-dark uppercase text-sm tracking-wider">
              Dinámica Mutua
            </span>
          </div>
          <div className="flex items-center gap-4">

            <button
              onClick={() => {
                cerrarSesion()
                router.push('/')
              }}
              className="text-xs text-neutral-500 hover:text-semantic-error transition-colors font-body"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8 animate-slide-up">
        <div className="mb-8">
          <h1 className="font-display text-brand-blue-dark text-3xl uppercase">
            Nuevo modelo organizativo de IT
          </h1>
          <p className="text-neutral-600 font-body text-sm mt-2 max-w-2xl">
            Navega por la matriz para consultar la información de cada área o añadir tus propias
            aportaciones al modelo.
          </p>
        </div>

        {/* Scroll horizontal en móvil */}
        <div className="overflow-x-auto pb-6">
          <div className="min-w-[1000px] grid grid-cols-7 gap-4">
            {/* Fila 1: Equipos de negocio (1-4) */}
            <Cell
              id="equipos-asegurador"
              titulo="Asegurador y Ecosistema"
              descripcion="Equipos de negocio y tecnología co-localizados"
              color="blue"
            />
            <Cell
              id="equipos-patrimonial"
              titulo="Patrimonial y Finanzas"
              descripcion="Equipos de negocio y tecnología co-localizados"
              color="blue"
            />
            <Cell
              id="equipos-movilidad"
              titulo="Movilidad"
              descripcion="Equipos de negocio y tecnología co-localizados"
              color="blue"
            />
            <Cell
              id="equipos-sistemas"
              titulo="Sistemas corporativos"
              descripcion="Equipos de negocio y tecnología co-localizados"
              color="blue"
            />

            {/* Columnas verticales (CISO, Platf, Tech) - Ocupan 5 filas */}
            <Cell
              id="ciso-global"
              titulo="CISO global"
              descripcion="Estrategia cyber, políticas globales de seguridad, compliance, red team, formación de seguridad, gobierno de participadas"
              color="blue"
              className="row-span-5"
            />
            <Cell
              id="plataforma-desarrollo"
              titulo="Plataforma de desarrollo"
              descripcion="Herramientas de desarrollo (e.g., Jira, repos, pipelines, seguridad en el código, Claude Code); planificación trimestral, gestión del portfolio / comité transf."
              color="blue"
              className="row-span-5"
            />
            <Cell
              id="tech-support"
              titulo="Tech support"
              descripcion="Costes, gestión de proveedores, FinOps, DORA y otras incitativas estratégicas"
              color="blue"
              className="row-span-5"
            />

            {/* Fila 3: Canales */}
            <Cell
              id="canales"
              titulo="Canales"
              descripcion="Plataforma de canales única (móvil, web privada, pública), CRM, 'offices' (futuro), canales de terceros (e.g., ECI, Europcar); desarrolladores de canal alocados por negocio"
              color="white"
              className="col-span-4"
            />

            {/* Fila 4: DAAR */}
            <Cell
              id="daar-transversales"
              titulo="DAAR y otras áreas transversales"
              descripcion="Expertos en datos, IA y procesos alocados por negocio / RRHH, Finanzas..."
              color="white"
              className="col-span-4"
            />

            {/* Fila 5: Arquitectura */}
            <Cell
              id="arquitectura-solucion"
              titulo="Arquitectura de solución"
              descripcion="Apoyan a los negocios en el uso de la plataforma tecnológica del grupo"
              color="white"
              className="col-span-4"
            />

            {/* Fila 6: CTO */}
            <Cell
              id="cto"
              titulo="CTO (Chief Technology Officer)"
              descripcion="Plataforma tecnológica y su gobierno utilizado por todos los negocios, incluye infraestructura, mainframe, cloud, comunicaciones, almacenamiento, aplicaciones y APIs, datos (todas), procesos e IA y componentes de seguridad (e.g., login, AuthZ, secretos, tokenización, etc.)"
              color="blue"
              className="col-span-4"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
