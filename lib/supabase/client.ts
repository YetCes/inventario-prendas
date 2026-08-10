import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copia .env.local.example a .env.local y completa los valores de tu proyecto de Supabase.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Nombre del bucket de Supabase Storage donde se guardan las fotos de las prendas.
export const BUCKET_FOTOS = 'prendas';
