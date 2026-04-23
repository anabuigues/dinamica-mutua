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
Antes de generar cualquier código, lee los skills disponibles en la carpeta .claude/skills de este repositorio y aplícalos en todo el desarrollo.

## Historias de usuario
Las historias de usuario están en: https://github.com/anabuigues/dinamica-mutua/issues

Impleméntalas en este orden:

### Épica 1 — Registro y acceso
- HU-01: Registro con nombre + área, sin correo. El sistema autogenera un identificador de 8 caracteres y una contraseña aleatoria que se muestran al usuario para que los anote.
- HU-02: Acceso posterior con identificador y contraseña autogenerados. La pantalla de inicio ofrece dos opciones: Nuevo registro o Ya tengo un identificador.

### Épica 2 — Canvas
- HU-03: Cumplimentar el canvas con todos sus campos (ver estructura más abajo)
- HU-04: Editar mi canvas. Solo el propietario puede editar el suyo.
- HU-05: Ver el canvas de otros participantes en modo lectura.

### Épica 3 — Dashboard
- HU-06: Dashboard de visión agregada, filtrable por área y con actualización en tiempo real.
- HU-07: Exportar resultados en PDF / Excel.

### Épica 4 — Administración
- HU-08: Súper usuario con panel para borrado unitario y masivo de canvas.

## Estructura del canvas
- Nombre y Área
- Misión: texto libre (cuál es la misión del área, quién es su cliente o principal socio)
- Implantación — retos en 4 categorías: Talento, Procesos, Cultura, Otros
- Traspasar / Recibir: tabla con dos columnas editables

## Modelo de datos (Supabase)
Tabla usuarios: id, nombre, area, identificador (8 chars, único), password_hash, rol (participante o superusuario), created_at
Tabla canvas: id, usuario_id (FK), mision, retos_talento, retos_procesos, retos_cultura, retos_otros, traspasar (jsonb), recibir (jsonb), updated_at

## Roles
- Participante: se registra con nombre + área, recibe identificador y contraseña autogenerados, puede cumplimentar y editar su propio canvas, y ver el de otros en modo lectura.
- Súper usuario: accede con credenciales fijas (no autogeneradas), puede ver todos los canvas, eliminar canvas individuales o borrar todo el contenido con confirmación explícita.

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
