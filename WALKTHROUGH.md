# Resumen del Estado del Proyecto — Dinámica Mutua

Este documento detalla el progreso actual de la plataforma **Dinámica Mutua**, las funcionalidades implementadas y las tareas pendientes.

## 🚀 Funcionalidades Implementadas

### Épica 1: Registro y Acceso (Completado)
- **HU-01 (Registro):** Formulario de registro con nombre y área. Generación automática de identificador (8 caracteres) y contraseña.
- **HU-02 (Acceso):** Sistema de login utilizando las credenciales autogeneradas. Persistencia de sesión mediante `localStorage`.

### Épica 2: Canvas (Completado)
- **HU-03 (Cumplimentar Canvas):** Estructura completa (Misión, Retos en 4 categorías, Traspasar/Recibir). Autoguardado con indicador visual.
- **HU-04 (Edición y Feedback):** Control de propiedad (solo el autor edita). Seguimiento de `updated_at` mostrado en la interfaz.
- **HU-05 (Exploración):** Vista de listado del equipo y visualización de canvas ajenos en modo lectura.

### Épica 3: Dashboard y Exportación (Completado)
- **HU-06 (Visión Agregada):** Dashboard con KPIs, agrupación de retos por categoría y actualización en tiempo real mediante Supabase Realtime.
- **HU-07 (Exportación):** 
  - Exportación de canvas individual a **PDF**.
  - Exportación de dashboard agregado a **PDF** y **Excel (XLSX)**.

### Épica 4: Administración (Completado)
- **HU-08 (Panel Superusuario):**
  - Panel administrativo accesible solo por rol `superusuario`.
  - Listado detallado de participantes y su estado.
  - Borrado individual de canvas/usuarios.
  - Borrado masivo (reinicio de sesión) con confirmación explícita.

## 🛠️ Infraestructura y DevOps
- **Supabase:** Configuración de tablas `usuarios` y `canvas` con RLS.
- **GitHub PRs:** Se han creado 5 Pull Requests organizadas por historias de usuario contra la rama `develop`.
- **CI/CD:** Configurado flujo de GitHub Actions para despliegue automático en GitHub Pages.
- **Design System:** Implementación completa de los tokens de marca de Mutua Madrileña (Colores, Oswald/Open Sans).

## 📝 Credenciales de Administrador (Superusuario)
Para activar el acceso administrativo, ejecutar el siguiente SQL en Supabase:

```sql
INSERT INTO usuarios (nombre, area, identificador, password_hash, rol)
VALUES (
  'Administrador',
  'Administración',
  'ADMIN-001',
  '$2b$10$zB/RbqTDuvu424BRFaJBo.RkT.Go..C3OH9nafBILQwobs2xM8//a',
  'superusuario'
) ON CONFLICT (identificador) DO NOTHING;
```
*   **Identificador:** `ADMIN-001`
*   **Contraseña:** `mutua-admin-2026`

## 📋 Próximos Pasos
1. **Revisión de PRs:** Merge de las PRs #13, #9, #10, #11 y #12 en ese orden.
2. **Validación de Despliegue:** Confirmar que la build de GitHub Actions finaliza correctamente tras el ajuste de `tsconfig.json`.
3. **Pruebas de Usuario:** Validar el flujo completo con datos reales de la sesión.

---
*Última actualización: 24 de abril de 2026*
