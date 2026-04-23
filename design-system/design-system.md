# Mutua Madrileña Design System

Sistema de diseño extraído de Claude Design para usar en el desarrollo con Claude Code.
Aplica estos tokens y patrones en todos los componentes visuales de la aplicación.

---

## 1. Colores

### Colores de marca principales
- Primary Blue (oscuro): #003087 — fondo hero, headers, elementos de marca
- Primary Blue (medio): #0050B3 — botones secundarios, enlaces activos
- Primary Blue (claro): #1A6FD4 — hover states, iconos
- CTA Pink / Magenta: #E8005A — botón primario de llamada a la acción, badges, acentos
- CTA Pink hover: #C40050 — hover del botón primario

### Escala de neutrales
- White: #FFFFFF
- Gray 50: #F8F9FA — fondos de página, backgrounds suaves
- Gray 100: #F1F3F5 — cards, inputs deshabilitados
- Gray 200: #E9ECEF — bordes, divisores
- Gray 400: #ADB5BD — placeholder text, iconos deshabilitados
- Gray 600: #6C757D — texto secundario
- Gray 800: #343A40 — texto principal
- Gray 900: #212529 — headings oscuros

### Colores semánticos
- Success: #28A745 — confirmaciones, estados positivos
- Warning: #FFC107 — alertas, estados de atención
- Error: #DC3545 — errores, estados críticos
- Info: #17A2B8 — información contextual

---

## 2. Tipografía

### Fuentes
- Display / Headings: Oswald Bold, uppercase — Google Fonts: https://fonts.google.com/specimen/Oswald
- Body / UI: Open Sans Regular/SemiBold — Google Fonts: https://fonts.google.com/specimen/Open+Sans

### Escala tipográfica Display (Oswald, uppercase)
- LG: 20px, weight 600 — títulos de sección grandes
- MD: 17px, weight 600 — subtítulos, nombres de producto
- BASE: 15px, weight 400 — body text estándar
- SM: 13px, weight 400 — texto secundario, captions
- XS: 11px, weight 500 — etiquetas, legal, uppercase labels

### Uso de tipografía
- Headings principales: Oswald Bold, uppercase, color Primary Blue o White
- Body text: Open Sans Regular, color Gray 800
- Labels de formulario: Open Sans SemiBold, color Gray 800
- Botones: Open Sans SemiBold, uppercase en CTAs
- Navigation: Open Sans Regular

---

## 3. Espaciado y layout

### Tokens de espaciado (base 4px)
- space-1: 4px
- space-2: 8px
- space-3: 12px
- space-4: 16px
- space-5: 20px
- space-6: 24px
- space-8: 32px
- space-10: 40px
- space-12: 48px
- space-16: 64px
- space-24: 96px

### Border radius
- radius-sm: 4px — inputs, badges pequeños
- radius-md: 8px — cards, botones
- radius-lg: 12px — modales, panels
- radius-xl: 16px — cards destacadas
- radius-full: 9999px — pills, avatares

---

## 4. Sombras

- shadow-sm: 0 1px 3px rgba(0,0,0,0.08) — cards en reposo
- shadow-md: 0 4px 12px rgba(0,0,0,0.12) — cards hover, dropdowns
- shadow-lg: 0 8px 24px rgba(0,0,0,0.16) — modales, popovers
- shadow-sticky: 0 2px 8px rgba(0,0,0,0.2) — navbar fijo, sticky bars

---

## 5. Componentes

### Botón primario (CTA Pink)
- Background: #E8005A
- Text: #FFFFFF, Open Sans SemiBold, uppercase
- Padding: 12px 24px
- Border radius: 8px
- Hover: #C40050
- Sombra: shadow-sm

### Botón secundario (outline azul)
- Background: transparent
- Border: 2px solid #0050B3
- Text: #0050B3, Open Sans SemiBold
- Padding: 10px 22px
- Border radius: 8px
- Hover: background #0050B3, text white

### Botón secundario relleno (azul)
- Background: #0050B3
- Text: #FFFFFF, Open Sans SemiBold
- Padding: 12px 24px
- Border radius: 8px
- Hover: #003087

### Tamaños de botones
- Large: padding 14px 28px, font-size 16px
- Medium: padding 10px 20px, font-size 14px (default)
- Small: padding 6px 14px, font-size 12px

### Navigation Pills (selector de categorías)
- Activa: background #003087, text white, border-radius 9999px, padding 8px 16px
- Inactiva: background #F1F3F5, text #343A40, border-radius 9999px, padding 8px 16px
- Hover: background #E9ECEF

### Product Cards (tarjetas de producto)
- Background: white
- Header: background Primary Blue, icono blanco centrado, padding 20px
- Body: padding 16px
- Título: Oswald MD, color Gray 900
- Descripción: Open Sans SM, color Gray 600
- CTA: botón primario pink, ancho completo
- Border radius: radius-lg
- Sombra: shadow-sm, hover shadow-md
- Borde: 1px solid Gray 200

### Form Elements
- Input/Select: border 1px solid Gray 200, radius-md, padding 10px 14px, focus border #0050B3
- Label: Open Sans SemiBold SM, color Gray 800, margin-bottom 6px
- Placeholder: color Gray 400
- Error state: border #DC3545, mensaje debajo en rojo
- Checkbox: accent-color #0050B3

### Hero Section
- Background: Primary Blue oscuro (#003087) con gradiente sutil
- Heading: Oswald LG uppercase, color white
- Subheading: Open Sans BASE, color rgba(255,255,255,0.85)
- CTA: botón primario pink centrado
- Padding: 80px 0

### Header / Navbar
- Background: white
- Logo: izquierda
- Nav links: Open Sans Regular, color Gray 800, hover Primary Blue
- CTA button: botón primario pink, esquina derecha
- Sticky: con shadow-sticky al hacer scroll
- Height: 64px

---

## 6. Iconos de producto (categorías)
Estilo: filled, monocromáticos, color white sobre fondo Primary Blue
Categorías disponibles:
- Coche
- Moto
- Hogar
- Vida
- Inversión
- Accidentes
- Micromovilidad

Tamaño estándar en cards: 32px x 32px

---

## 7. Implementación con Tailwind CSS

### Config recomendado (tailwind.config.js)
Amplía el theme con estos valores:
- colors.brand.blue.dark: #003087
- colors.brand.blue.mid: #0050B3
- colors.brand.blue.light: #1A6FD4
- colors.brand.pink: #E8005A
- colors.brand.pink-hover: #C40050
- fontFamily.display: Oswald, sans-serif
- fontFamily.body: Open Sans, sans-serif

### Google Fonts a importar
```
https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Open+Sans:wght@400;600;700&display=swap
```

---

## 8. Voz y tono visual
- Confianza y solidez: azul como color dominante
- Energía en CTAs: rosa/magenta para llamadas a la acción
- Claridad: tipografía sin serif, espaciado generoso
- Profesional pero accesible: no demasiado corporativo, cercano al usuario
