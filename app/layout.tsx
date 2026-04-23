import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dinámica Mutua — Nuevo Modelo Organizativo',
  description: 'Herramienta para la dinámica organizativa de Mutua Madrileña. Registra tu visión, completa tu canvas y comparte tu perspectiva sobre el nuevo modelo.',
  keywords: 'Mutua Madrileña, dinámica organizativa, canvas, modelo organizativo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-neutral-50 font-body antialiased">
        {children}
      </body>
    </html>
  )
}
