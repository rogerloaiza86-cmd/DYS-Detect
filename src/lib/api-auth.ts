import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './supabase';

// ─── Vérification serveur du jeton Supabase (routes API) ─────────────────

export interface AuthContext {
  user: User | null;
  /** Client Supabase porteur du jeton utilisateur — les policies RLS s'appliquent. */
  supabase: SupabaseClient | null;
}

/**
 * Vérifie le jeton `Authorization: Bearer <access_token>` de la requête.
 * Retourne null si le jeton est absent ou invalide.
 * En mode démonstration (Supabase non configuré), l'authentification est
 * désactivée et un contexte vide est retourné.
 */
export async function requireUser(request: Request): Promise<AuthContext | null> {
  if (!isSupabaseConfigured) {
    return { user: null, supabase: null };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } },
  );

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  return { user: data.user, supabase: client };
}

export function unauthorized() {
  return Response.json({ error: 'Authentification requise' }, { status: 401 });
}
