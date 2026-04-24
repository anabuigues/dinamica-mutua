-- Truncate the table to remove orphaned canvases without areas
TRUNCATE TABLE public.canvas;

-- Add area_id column
ALTER TABLE public.canvas ADD COLUMN area_id text NOT NULL;

-- Drop the old primary key if necessary, or just add a unique constraint
-- The table has an 'id' uuid primary key, which is fine to keep, but we need
-- to ensure a user can only have one canvas per area.
ALTER TABLE public.canvas ADD CONSTRAINT canvas_usuario_id_area_id_key UNIQUE (usuario_id, area_id);
