import { createClient } from '@supabase/supabase-js'

// La URL base sin /rest/v1/
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente público para uso en el browser (RLS activo)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
