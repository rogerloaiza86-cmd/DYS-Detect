import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIp } from '../rate-limit';

afterEach(() => {
  vi.useRealTimers();
});

describe('checkRateLimit', () => {
  it('autorise jusqu’à la limite puis bloque', () => {
    const key = `t-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000)).toBe(true);
    }
    expect(checkRateLimit(key, 5, 60_000)).toBe(false);
  });

  it('isole les clés entre elles', () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    expect(checkRateLimit(a, 1, 60_000)).toBe(true);
    expect(checkRateLimit(a, 1, 60_000)).toBe(false);
    expect(checkRateLimit(b, 1, 60_000)).toBe(true);
  });

  it('libère la fenêtre après expiration', () => {
    vi.useFakeTimers();
    const key = `w-${Math.random()}`;
    expect(checkRateLimit(key, 1, 1_000)).toBe(true);
    expect(checkRateLimit(key, 1, 1_000)).toBe(false);
    vi.advanceTimersByTime(1_001);
    expect(checkRateLimit(key, 1, 1_000)).toBe(true);
  });
});

describe('getClientIp', () => {
  it('extrait la première IP de x-forwarded-for', () => {
    const req = new Request('http://localhost/', {
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('203.0.113.7');
  });

  it('retourne unknown sans en-tête', () => {
    expect(getClientIp(new Request('http://localhost/'))).toBe('unknown');
  });
});
