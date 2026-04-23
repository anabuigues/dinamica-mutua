-- ─── Migración 002: Superusuario ──────────────────────────────────────────────
-- Ejecutar en Supabase SQL Editor para crear el superusuario de la sesión.
-- Sustituir 'TU_PASSWORD_AQUI' por la contraseña deseada y
-- 'ADMIN-XXXX' por el identificador que quieras usar para acceder.
--
-- El password_hash se genera con bcrypt cost=10. Puedes generarlo en:
--   https://bcrypt.online  o con:  node -e "const b=require('bcryptjs'); console.log(b.hashSync('tu_password',10))"

INSERT INTO usuarios (nombre, area, identificador, password_hash, rol)
VALUES (
  'Administrador',
  'Administración',
  'ADMIN-001',
  '$2a$10$SUSTITUYE_ESTE_HASH_POR_EL_REAL',
  'superusuario'
)
ON CONFLICT (identificador) DO NOTHING;

-- Ejemplo de cómo generar el hash en Node.js:
-- node -e "const b=require('bcryptjs'); console.log(b.hashSync('mi_password_secreto', 10))"
-- Y pegar el resultado en el campo password_hash de arriba.
