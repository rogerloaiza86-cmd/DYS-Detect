// ─── Rate limiting en mémoire (fenêtre glissante par IP + route) ─────────
// Suffisant pour une instance unique (Vercel : par lambda chaude). Pour un
// déploiement multi-instances à fort trafic, remplacer par Upstash/Redis.

const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 10_000;

export function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

/**
 * Retourne true si la requête est autorisée, false si la limite est atteinte.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter(t => now - t < windowMs);

  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) buckets.clear();
  buckets.set(key, timestamps);
  return true;
}

export function rateLimited() {
  return Response.json(
    { error: 'Trop de requêtes — réessayez dans une minute' },
    { status: 429, headers: { 'Retry-After': '60' } },
  );
}

/**
 * Garde combinée pour les routes API : limite par IP sur la route donnée.
 */
export function checkRoute(request: Request, route: string, limit: number, windowMs = 60_000): boolean {
  return checkRateLimit(`${route}:${getClientIp(request)}`, limit, windowMs);
}
