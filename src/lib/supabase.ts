import { createClient } from '@supabase/supabase-js';

// Valeurs de repli pour permettre le build et le mode démonstration
// sans projet Supabase configuré (les appels échoueront proprement
// et les fallbacks mock de l'app prendront le relais).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Mode démonstration : sans projet Supabase, l'authentification et la
// persistance sont désactivées (données mock, accès libre au portail).
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseKey);
