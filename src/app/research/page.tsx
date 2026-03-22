"use client";

import { useState, useEffect, useMemo } from 'react';
import { getStudents, getResults, getDiagnosticLabels } from '@/lib/store';
import { extractTextFeatures, extractAudioFeatures, mergeFeatures, FeatureVector, FEATURE_LABELS } from '@/lib/features';
import { Student, AnalysisResult, DiagnosticLabel, DisorderCategory } from '@/lib/types';
import Link from 'next/link';

const DISORDER_COLORS: Record<DisorderCategory, string> = {
  DYS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  TDAH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  TSA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const CATEGORIES = ['Phonologie', 'Morphosyntaxe', 'Lexique', 'Pragmatique', 'Audio', 'Graphomoteur'] as const;

export default function ResearchPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [labels, setLabels] = useState<Map<string, DiagnosticLabel[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDisorder, setSelectedDisorder] = useState<DisorderCategory | 'all'>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const [stu, res] = await Promise.all([getStudents(), getResults()]);
      setStudents(stu);
      setResults(res);

      // Load labels for ULIS students
      const labelMap = new Map<string, DiagnosticLabel[]>();
      for (const s of stu.filter(s => s.isUlisStudent)) {
        const l = await getDiagnosticLabels(s.id);
        if (l.length > 0) labelMap.set(s.id, l);
      }
      setLabels(labelMap);
      setLoading(false);
    }
    load();
  }, []);

  // Extract feature vectors from all results
  const featureVectors = useMemo(() => {
    return results.map(r => {
      const student = students.find(s => s.id === r.studentId);
      const textF = extractTextFeatures(r.transcription, r.referenceText || undefined);
      const audioF = r.audioMetadata ? extractAudioFeatures(r.audioMetadata) : {};
      return {
        vector: mergeFeatures(
          { studentId: r.studentId, analysisId: r.id, analysisMode: r.analysisMode || 'dictee', studentAge: student?.age || 0, date: r.date },
          textF, audioF
        ),
        student,
        result: r,
        diagnoses: labels.get(r.studentId) || [],
      };
    });
  }, [results, students, labels]);

  // Compute averages per disorder
  const averagesByDisorder = useMemo(() => {
    const groups: Record<string, FeatureVector[]> = { DYS: [], TDAH: [], TSA: [], Sain: [] };

    for (const { vector, diagnoses } of featureVectors) {
      if (diagnoses.length === 0) {
        groups['Sain'].push(vector);
      } else {
        for (const d of diagnoses) {
          if (!groups[d.disorder]) groups[d.disorder] = [];
          groups[d.disorder].push(vector);
        }
      }
    }

    const featureKeys = Object.keys(FEATURE_LABELS) as (keyof typeof FEATURE_LABELS)[];
    const averages: Record<string, Record<string, number | null>> = {};

    for (const [group, vectors] of Object.entries(groups)) {
      averages[group] = {};
      for (const key of featureKeys) {
        const values = vectors.map(v => v[key]).filter((v): v is number => v !== null && typeof v === 'number');
        averages[group][key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
      }
    }

    return { groups, averages };
  }, [featureVectors]);

  // Filter feature labels
  const filteredFeatures = useMemo(() => {
    return (Object.entries(FEATURE_LABELS) as [keyof typeof FEATURE_LABELS, (typeof FEATURE_LABELS)[keyof typeof FEATURE_LABELS]][]).filter(([, meta]) => {
      if (selectedCategory !== 'all' && meta.category !== selectedCategory) return false;
      if (selectedDisorder !== 'all' && !meta.relevantFor.includes(selectedDisorder)) return false;
      return true;
    });
  }, [selectedCategory, selectedDisorder]);

  const handleExport = async (format: 'csv' | 'jsonl') => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export-training-data?format=${format}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dys-detect-training-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
      alert('Erreur lors de l\'export');
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-headline">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const labeledCount = featureVectors.filter(v => v.diagnoses.length > 0).length;
  const unlabeledCount = featureVectors.length - labeledCount;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">
            Recherche & Données
          </h1>
          <p className="text-on-surface-variant font-body mt-1">
            Variables objectives extraites — corrélation avec diagnostics confirmés
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-on-secondary font-headline font-bold rounded-xl hover:bg-secondary/80 transition-all text-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
          <button
            onClick={() => handleExport('jsonl')}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-headline font-bold rounded-xl hover:bg-primary-dim transition-all text-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">code</span>
            Export JSONL
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
          <p className="text-3xl font-headline font-black text-primary">{featureVectors.length}</p>
          <p className="text-sm text-on-surface-variant">Analyses totales</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
          <p className="text-3xl font-headline font-black text-secondary">{labeledCount}</p>
          <p className="text-sm text-on-surface-variant">Avec diagnostic confirmé</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
          <p className="text-3xl font-headline font-black text-on-surface">{unlabeledCount}</p>
          <p className="text-sm text-on-surface-variant">Sans diagnostic</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
          <p className="text-3xl font-headline font-black text-tertiary">{Object.keys(FEATURE_LABELS).length}</p>
          <p className="text-sm text-on-surface-variant">Variables mesurées</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-on-surface text-sm font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
        >
          <option value="all">Toutes les catégories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={selectedDisorder}
          onChange={e => setSelectedDisorder(e.target.value as DisorderCategory | 'all')}
          className="px-4 py-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-on-surface text-sm font-body focus:ring-2 focus:ring-primary/50 focus:outline-none"
        >
          <option value="all">Tous les troubles</option>
          <option value="DYS">DYS</option>
          <option value="TDAH">TDAH</option>
          <option value="TSA">TSA</option>
        </select>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-xl text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Matrice de comparaison des variables
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Moyenne de chaque variable par groupe diagnostic. Les écarts significatifs révèlent les marqueurs discriminants.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="text-left p-4 font-headline font-bold text-on-surface sticky left-0 bg-surface-container-low z-10 min-w-[200px]">Variable</th>
                <th className="text-center p-4 font-headline font-bold text-on-surface min-w-[100px]">Catégorie</th>
                {['Sain', 'DYS', 'TDAH', 'TSA'].map(g => (
                  <th key={g} className="text-center p-4 font-headline font-bold min-w-[100px]">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      g === 'DYS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : g === 'TDAH' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : g === 'TSA' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>{g} ({averagesByDisorder.groups[g]?.length || 0})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map(([key, meta], idx) => {
                const values = ['Sain', 'DYS', 'TDAH', 'TSA'].map(g => averagesByDisorder.averages[g]?.[key] ?? null);
                const nonNull = values.filter((v): v is number => v !== null);
                const max = nonNull.length > 0 ? Math.max(...nonNull) : 0;
                const min = nonNull.length > 0 ? Math.min(...nonNull) : 0;
                const range = max - min;

                return (
                  <tr key={key} className={`${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'} hover:bg-primary/5 transition-colors`}>
                    <td className={`p-4 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}>
                      <div className="font-headline font-bold text-on-surface text-sm">{meta.label}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{meta.description}</div>
                      <div className="flex gap-1 mt-1">
                        {meta.relevantFor.map(d => (
                          <span key={d} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${DISORDER_COLORS[d]}`}>{d}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-headline text-on-surface-variant">{meta.category}</span>
                    </td>
                    {values.map((val, i) => {
                      if (val === null) return <td key={i} className="p-4 text-center text-on-surface-variant/50 text-xs">—</td>;

                      // Highlight cells that deviate significantly from the "Sain" baseline
                      const sainVal = values[0];
                      const isHighlight = sainVal !== null && range > 0 && Math.abs(val - sainVal) / (range || 1) > 0.3;

                      const formatted = meta.unit === '%' ? `${(val * 100).toFixed(0)}%`
                        : meta.unit === '0-1' ? val.toFixed(2)
                        : meta.unit === 'ms' ? `${Math.round(val)}ms`
                        : meta.unit === 'wpm' ? `${Math.round(val)}`
                        : meta.unit === 'ratio' ? val.toFixed(2)
                        : meta.unit === 'mots' ? val.toFixed(1)
                        : String(Math.round(val * 100) / 100);

                      return (
                        <td key={i} className={`p-4 text-center font-mono text-sm font-bold ${
                          isHighlight ? (val > (sainVal || 0) ? 'text-error bg-error/5' : 'text-secondary bg-secondary/5') : 'text-on-surface'
                        }`}>
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
        <h3 className="font-headline font-bold text-on-surface mb-3">Lecture de la matrice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-on-surface-variant font-body">
          <div className="flex items-start gap-3">
            <span className="w-4 h-4 rounded bg-error/20 border border-error/30 mt-0.5 shrink-0" />
            <span>Valeur <strong className="text-error">significativement plus élevée</strong> que le groupe sain → marqueur potentiel du trouble</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-4 h-4 rounded bg-secondary/20 border border-secondary/30 mt-0.5 shrink-0" />
            <span>Valeur <strong className="text-secondary">significativement plus basse</strong> que le groupe sain → marqueur inversé</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <span>Les données sont pseudonymisées à l&apos;export (IDs remplacés, pas de noms).</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg">science</span>
            <span>Plus il y a d&apos;analyses labelisées, plus les corrélations sont fiables. Objectif : 30+ par trouble.</span>
          </div>
        </div>
      </div>

      {/* Individual Vectors */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10">
          <h2 className="font-headline font-bold text-xl text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">table_chart</span>
            Détail par analyse ({featureVectors.length} entrées)
          </h2>
        </div>

        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-container-low">
                <th className="text-left p-3 font-headline font-bold sticky left-0 bg-surface-container-low z-20">Élève</th>
                <th className="text-center p-3 font-headline font-bold">Mode</th>
                <th className="text-center p-3 font-headline font-bold">Diagnostic</th>
                {filteredFeatures.slice(0, 15).map(([key, meta]) => (
                  <th key={key} className="text-center p-3 font-headline font-bold min-w-[80px]" title={meta.description}>
                    {meta.label.length > 15 ? meta.label.slice(0, 15) + '...' : meta.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureVectors.map(({ vector, student, result, diagnoses }, idx) => (
                <tr key={vector.analysisId} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}>
                  <td className={`p-3 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}`}>
                    <Link href={`/results/${result.id}`} className="text-primary hover:underline font-bold">
                      {student?.firstName} {student?.lastName?.[0]}.
                    </Link>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-bold">
                      {vector.analysisMode}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {diagnoses.length > 0 ? diagnoses.map(d => (
                      <span key={d.id} className={`text-[10px] px-2 py-0.5 rounded-full font-bold mr-1 ${DISORDER_COLORS[d.disorder]}`}>
                        {d.subtype || d.disorder}
                      </span>
                    )) : <span className="text-on-surface-variant/50">—</span>}
                  </td>
                  {filteredFeatures.slice(0, 15).map(([key]) => {
                    const val = vector[key as keyof FeatureVector];
                    return (
                      <td key={key} className="p-3 text-center font-mono">
                        {val === null ? <span className="text-on-surface-variant/30">—</span> : (
                          typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(2)) : String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-4">
        <Link href="/new-analysis" className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-headline font-bold rounded-xl hover:bg-primary-dim transition-all">
          <span className="material-symbols-outlined">add</span>
          Nouvelle analyse
        </Link>
        <Link href="/students" className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-all">
          <span className="material-symbols-outlined">group</span>
          Gérer les élèves
        </Link>
      </div>
    </div>
  );
}
