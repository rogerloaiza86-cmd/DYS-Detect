import { describe, it, expect } from 'vitest';
import { TEXTS_BANK, getTextsByGrade, getTextsByTarget } from '../texts-bank';

describe('TEXTS_BANK', () => {
  it('contient une banque substantielle de textes', () => {
    expect(TEXTS_BANK.length).toBeGreaterThanOrEqual(20);
  });

  it('a des identifiants uniques', () => {
    const ids = TEXTS_BANK.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a un texte non vide et un wordCount cohérent pour chaque entrée', () => {
    for (const t of TEXTS_BANK) {
      expect(t.text.trim().length, t.id).toBeGreaterThan(0);
      expect(t.wordCount, t.id).toBeGreaterThan(0);
      expect(t.gradeLevel.length, t.id).toBeGreaterThan(0);
      expect(t.targets.length, t.id).toBeGreaterThan(0);
    }
  });

  it('couvre tous les niveaux du CP à la 4e', () => {
    const grades = new Set(TEXTS_BANK.flatMap(t => t.gradeLevel));
    for (const g of ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6eme', '5eme', '4eme'] as const) {
      expect(grades.has(g), `niveau ${g}`).toBe(true);
    }
  });
});

describe('getTextsByGrade / getTextsByTarget', () => {
  it('filtre par niveau', () => {
    const cp = getTextsByGrade('CP');
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every(t => t.gradeLevel.includes('CP'))).toBe(true);
  });

  it('filtre par trouble ciblé', () => {
    const dys = getTextsByTarget('DYS');
    expect(dys.length).toBeGreaterThan(0);
    expect(dys.every(t => t.targets.includes('DYS'))).toBe(true);
  });
});
