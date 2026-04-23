# Dinámica Mutua

Aplicación web para digitalizar una dinámica organizativa presencial. Permite a los participantes registrarse, cumplimentar un canvas individual con su visión sobre el nuevo modelo organizativo, y visualizar los canvas del resto de compañeros.

## Stack tecnológico

- **Framework:** Next.js 14 (App Router, export estático)
- **Estilos:** Tailwind CSS
- **Base de datos y Auth:** Supabase (PostgreSQL)
- **Despliegue:** GitHub Pages via GitHub Actions

## Funcionalidades

- Registro con nombre y área — el sistema genera un identificador y contraseña automáticos
- Acceso posterior con identificador y contraseña autogenerados
- Canvas individual con misión, retos (Talento, Procesos, Cultura, Otros) y tabla Traspasar / Recibir
- Visualización de los canvas de otros participantes en modo lectura
- Dashboard agregado filtrable por área con actualización en tiempo real
- Exportación de resultados en PDF / Excel
- Panel de administración para súper usuario

## Instalación

```bash
npm install
```

Crea un archivo `.env.local` en la raíz con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Desarrollo

```bash
npm run dev
```

## Despliegue

El despliegue es automático en GitHub Pages al hacer push a `main` mediante GitHub Actions. Las variables de entorno deben estar configuradas en GitHub → Settings → Secrets and variables → Actions.
