# CLAUDE.md — Dinámica Mutua

## Descripción del proyecto
Aplicación web para digitalizar una dinámica organizativa presencial. Permite a los participantes registrarse, cumplimentar un canvas individual con su visión sobre el nuevo modelo organizativo, y visualizar los canvas del resto de compañeros.

## Sistema de diseño
Lee el sistema de diseño completo en /design-system/ antes de crear cualquier componente visual.
Aplica los tokens de color, tipografía y espaciado definidos en él.

## Stack tecnológico
- Framework: Next.js 14 (App Router, export estático)
- Estilos: Tailwind CSS
- Base de datos y Auth: Supabase (PostgreSQL + autenticación)
- Despliegue: GitHub Pages via GitHub Actions
- CI/CD: GitHub Actions (.github/workflows/deploy.yml)

## Skills disponibles
Antes de generar cualquier código, lee los skills disponibles en la carpeta /skills de este repositorio y aplícalos en todo el desarrollo.

## Historias de usuario
Las historias de usuario están en: https://github.com/anabuigues/dinamica-mutua/issues

## Despliegue — GitHub Pages + GitHub Actions
Crear .github/workflows/deploy.yml que ejecute: checkout, setup-node 18, npm install, npm run build, y publique ./out en gh-pages usando peaceiris/actions-gh-pages@v3 con el GITHUB_TOKEN.

## Variables de entorno
Crear .env.local (no subir al repo) con:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

Añadir las mismas variables en GitHub → Settings → Secrets and variables → Actions.

## Convenciones de código
- Componentes en /components, páginas en /app
- Funciones de Supabase en /lib/supabase.ts
- Tipos TypeScript en /types
- Commits en español, formato: [HU-XX] descripción del cambio
