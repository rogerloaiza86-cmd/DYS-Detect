"use client";

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentById, getResultsByStudent, getDiagnosticLabels } from '@/lib/store';
import { Student, AnalysisResult, DiagnosticLabel, DisorderCategory } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Couleurs par catégorie de trouble
const CATEGORY_COLORS: Record<DisorderCategory, string> = {
  DYS:  '#3b82f6', // bleu
  TDAH: '#f97316', // orange
  TSA:  '#8b5cf6', // violet
};

// Couleur par défaut si pas de catégorie
const DEFAULT_LINE_COLOR = '#64748b';

export default function StudentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [diagnosticLabels, setDiagnosticLabels] = useState<DiagnosticLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      getStudentById(id),
      getResultsByStudent(id),
      getDiagnosticLabels(id),
    ]).then(([s, r, labels]) => {
      if (!s) { setNotFound(true); setLoading(false); return; }
      setStudent(s);
      setResults([...r].reverse()); // newest first
      setDiagnosticLabels(labels);
      setLoading(false);
    });
  }, [id]);

  const getRiskUI = (level: string) => {
    switch (level) {
      case 'Risque Élevé':  return { badge: 'bg-error-container/20 text-error border border-error/20',       dot: 'bg-error',     icon: 'priority_high' };
      case 'Risque Modéré': return { badge: 'bg-tertiary-container/30 text-tertiary border border-tertiary/20', dot: 'bg-tertiary',  icon: 'warning' };
      case 'Sain':          return { badge: 'bg-secondary-container/30 text-secondary border border-secondary/20', dot: 'bg-secondary', icon: 'check_circle' };
      default:              return { badge: 'bg-surface-variant text-on-surface-variant border border-outline-variant/20', dot: 'bg-outline-variant', icon: 'help' };
    }
  };

  // ── Données pour le graphique longitudinal ─────────────────────────────
  // On prend les résultats dans l'ordre chronologique (le tableau results est newest-first)
  const chronologicalResults = [...results].reverse();

  // Récupérer tous les marqueurs distincts présents dans au moins une analyse
  const allMarkerNames: string[] = Array.from(
    new Set(chronologicalResults.flatMap(r => r.markers.map(m => m.name)))
  );

  // Construire les données du graphique : une entrée par analyse
  const chartData = chronologicalResults.map(r => {
    const entry: Record<string, string | number> = {
      date: new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    };
    allMarkerNames.forEach(name => {
      const marker = r.markers.find(m => m.name === name);
      entry[name] = marker ? marker.score : 0;
    });
    return entry;
  });

  // Couleur d'une ligne selon la catégorie du marqueur (on cherche dans les résultats)
  const getLineColor = (markerName: string): string => {
    for (const r of chronologicalResults) {
      const marker = r.markers.find(m => m.name === markerName);
      if (marker?.category) return CATEGORY_COLORS[marker.category] ?? DEFAULT_LINE_COLOR;
    }
    return DEFAULT_LINE_COLOR;
  };

  // ── Analyse différentielle : marqueurs discriminants sur la dernière analyse ──
  const lastResult = results[0] ?? null;

  // Grouper les scores par catégorie sur la dernière analyse
  const categoryScores: Record<string, number[]> = {};
  if (lastResult) {
    for (const m of lastResult.markers) {
      const cat = m.category ?? 'Autre';
      if (!categoryScores[cat]) categoryScores[cat] = [];
      categoryScores[cat].push(m.score);
    }
  }
  // Catégories avec score moyen > 40%
  const highCategories = Object.entries(categoryScores)
    .map(([cat, scores]) => ({ cat, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
    .filter(({ avg }) => avg > 40);

  // Marqueurs discriminants : score > 40 et présents dans ≥2 catégories "à risque"
  const discriminatingMarkers = lastResult
    ? lastResult.markers.filter(m => m.score > 40 && highCategories.length >= 2)
    : [];

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant font-body animate-pulse">Chargement du dossier...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <span className="material-symbols-outlined text-error text-6xl">error</span>
      <h2 className="text-3xl font-headline font-bold text-on-surface">Élève introuvable</h2>
      <Link href="/students" className="flex items-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold">
        <span className="material-symbols-outlined">arrow_back</span> Retour aux élèves
      </Link>
    </div>
  );

  if (!student) return null;

  const riskUI = getRiskUI(student.riskLevel);
  const totalAnalyses = results.length;

  // Compute trend: last 2 analyses
  const trend = results.length >= 2
    ? results[0].globalRiskLevel === results[1].globalRiskLevel ? 'stable'
      : (results[0].globalRiskLevel === 'Sain' || (results[0].globalRiskLevel === 'Risque Modéré' && results[1].globalRiskLevel === 'Risque Élevé')) ? 'amélioration'
      : 'dégradation'
    : null;

  const severityLabel: Record<string, string> = {
    leger: 'Léger',
    modere: 'Modéré',
    severe: 'Sévère',
  };

  const consentIcon = student.consentStatus === 'signed'
    ? 'verified_user'
    : student.consentStatus === 'refused'
    ? 'gpp_bad'
    : 'pending';

  const consentColor = student.consentStatus === 'signed'
    ? 'text-secondary'
    : student.consentStatus === 'refused'
    ? 'text-error'
    : 'text-tertiary';

  const consentLabel = student.consentStatus === 'signed'
    ? 'Consentement signé'
    : student.consentStatus === 'refused'
    ? 'Consentement refusé'
    : 'Consentement en attente';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <Link href="/students" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-6 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Gestion des élèves
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-headline font-black text-2xl shadow-sm border border-primary/10">
              {student.initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-headline font-black text-4xl text-on-surface tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                {student.isUlisStudent && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 rounded-full text-xs font-bold">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    Pôle ULIS
                  </span>
                )}
              </div>
              <p className="text-on-surface-variant font-body text-lg mt-1">
                {student.grade} · {student.age} ans
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-3 flex-wrap">
            {lastResult && (
              <Link
                href={`/new-analysis?reevaluation=${lastResult.id}`}
                className="flex items-center gap-2 border-2 border-primary/30 text-primary px-6 py-3.5 rounded-xl font-headline font-bold hover:bg-primary/10 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>refresh</span>
                Réévaluation
              </Link>
            )}
            <Link
              href="/new-analysis"
              className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              Nouvelle analyse
            </Link>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <p className="text-on-surface-variant font-label text-sm mb-2">Statut actuel</p>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${riskUI.badge}`}>
            <span className={`w-2 h-2 rounded-full ${riskUI.dot}`}></span>
            {student.riskLevel}
          </span>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <p className="text-on-surface-variant font-label text-sm mb-2">Analyses réalisées</p>
          <p className="font-headline font-bold text-3xl text-on-surface">{totalAnalyses}</p>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm">
          <p className="text-on-surface-variant font-label text-sm mb-2">Tendance</p>
          {trend === null ? (
            <p className="text-on-surface-variant font-body text-sm italic">Pas encore de données</p>
          ) : (
            <span className={`inline-flex items-center gap-2 font-headline font-bold text-sm ${
              trend === 'amélioration' ? 'text-secondary' :
              trend === 'dégradation' ? 'text-error' : 'text-on-surface-variant'
            }`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {trend === 'amélioration' ? 'trending_up' : trend === 'dégradation' ? 'trending_down' : 'trending_flat'}
              </span>
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          )}
        </div>
      </div>

      {/* Carte ULIS / Diagnostic */}
      {student.isUlisStudent && diagnosticLabels.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#8b5cf6]/20 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#8b5cf6]/10 bg-[#8b5cf6]/5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8b5cf6] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface">Dossier ULIS</h2>
                <p className="text-on-surface-variant font-body text-sm mt-0.5">Diagnostics confirmés et statut RGPD</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 rounded-full text-sm font-bold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              Pôle ULIS
            </span>
          </div>

          <div className="p-6 space-y-4">
            {/* Diagnostics */}
            <div className="space-y-3">
              {diagnosticLabels.map(label => (
                <div key={label.id} className="flex items-start gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-headline font-black text-sm ${
                    label.disorder === 'DYS'  ? 'bg-blue-500/10 text-blue-500' :
                    label.disorder === 'TDAH' ? 'bg-orange-500/10 text-orange-500' :
                    'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                  }`}>
                    {label.disorder}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-headline font-bold text-on-surface">{label.disorder}</p>
                      {label.subtype && (
                        <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-full">
                          {label.subtype}
                        </span>
                      )}
                      {label.severity && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                          label.severity === 'severe' ? 'bg-error/10 text-error' :
                          label.severity === 'modere' ? 'bg-tertiary/10 text-tertiary' :
                          'bg-secondary/10 text-secondary'
                        }`}>
                          {severityLabel[label.severity]}
                        </span>
                      )}
                    </div>
                    <p className="text-on-surface-variant font-body text-xs mt-1">
                      Confirmé par {label.confirmedBy} · {new Date(label.confirmedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {label.notes && (
                      <p className="text-on-surface-variant font-body text-xs mt-1 italic">{label.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Statut consentement RGPD */}
            <div className="flex items-center gap-3 p-4 bg-surface-container rounded-xl border border-outline-variant/10">
              <span className={`material-symbols-outlined text-2xl ${consentColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {consentIcon}
              </span>
              <div>
                <p className={`font-headline font-bold text-sm ${consentColor}`}>{consentLabel}</p>
                {student.consentGuardianName && (
                  <p className="text-on-surface-variant font-body text-xs mt-0.5">
                    Responsable légal : {student.consentGuardianName}
                    {student.consentDate && ` · ${new Date(student.consentDate).toLocaleDateString('fr-FR')}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique d'évolution longitudinale */}
      {results.length >= 2 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30">
            <h2 className="font-headline font-bold text-xl text-on-surface">Évolution des indicateurs</h2>
            <p className="text-on-surface-variant font-body text-sm mt-1">
              Scores 0–100 par marqueur sur l&apos;ensemble des analyses
            </p>
          </div>
          <div className="p-6">
            {/* Légende par catégorie */}
            <div className="flex flex-wrap gap-4 mb-4">
              {(Object.entries(CATEGORY_COLORS) as [DisorderCategory, string][]).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-body text-on-surface-variant">{cat}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant, #64748b)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(128,128,128,0.2)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant, #64748b)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid rgba(128,128,128,0.15)',
                    fontSize: '13px',
                    background: 'var(--color-surface-container-lowest, #fff)',
                  }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={(value: string) => (
                    <span style={{ color: 'var(--color-on-surface-variant, #64748b)' }}>
                      {value.split(' ')[0]}
                    </span>
                  )}
                />
                {allMarkerNames.map(name => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={getLineColor(name)}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Analyse différentielle : Points d'attention */}
      {discriminatingMarkers.length > 0 && highCategories.length >= 2 && (
        <div className="bg-tertiary-container/10 rounded-2xl border border-tertiary/20 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-tertiary/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-tertiary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface">Points d&apos;attention</h2>
              <p className="text-on-surface-variant font-body text-sm mt-0.5">
                Dernière analyse · {highCategories.length} troubles scorent &gt;40% — marqueurs discriminants
              </p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {discriminatingMarkers.map(m => (
                <div
                  key={m.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-body text-sm ${
                    m.score > 70
                      ? 'bg-error/10 border-error/20 text-error'
                      : 'bg-tertiary/10 border-tertiary/20 text-tertiary'
                  }`}
                >
                  <span className="font-bold">{m.score}%</span>
                  <span>{m.name}</span>
                  {m.category && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[m.category]}20`,
                        color: CATEGORY_COLORS[m.category],
                      }}
                    >
                      {m.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline des analyses */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 bg-surface-container-low/30">
          <h2 className="font-headline font-bold text-xl text-on-surface">Historique des analyses</h2>
          <p className="text-on-surface-variant font-body text-sm mt-1">Du plus récent au plus ancien</p>
        </div>

        {results.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-outline-variant mb-4 block">history</span>
            <p className="text-on-surface-variant font-body text-lg">Aucune analyse enregistrée.</p>
            <Link href="/new-analysis" className="mt-4 inline-flex items-center gap-2 text-primary font-headline font-bold hover:underline">
              Démarrer une première analyse
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {results.map((result, idx) => {
              const ui = getRiskUI(result.globalRiskLevel);
              const topMarker = [...result.markers].sort((a, b) => b.score - a.score)[0];
              return (
                <div key={result.id} className="p-6 hover:bg-surface-container-low/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-5">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center shrink-0 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 border-surface-container-lowest shadow-sm ${ui.dot}`}></div>
                        {idx < results.length - 1 && <div className="w-0.5 h-12 bg-outline-variant/20 mt-1"></div>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <p className="font-headline font-bold text-on-surface">
                            {new Date(result.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                          {idx === 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">Dernière</span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ui.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ui.dot}`}></span>
                            {result.globalRiskLevel}
                          </span>
                        </div>

                        {/* Top markers preview */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.markers.slice(0, 3).map(m => (
                            <div key={m.name} className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-lg">
                              <span className="text-xs text-on-surface-variant font-body">{m.name.split(' ')[0]}</span>
                              <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${m.score > 70 ? 'bg-error' : m.score > 40 ? 'bg-tertiary' : 'bg-secondary'}`}
                                  style={{ width: `${m.score}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${m.score > 70 ? 'text-error' : m.score > 40 ? 'text-tertiary' : 'text-secondary'}`}>
                                {m.score}%
                              </span>
                            </div>
                          ))}
                        </div>

                        {topMarker && (
                          <p className="text-xs text-on-surface-variant font-body mt-2 italic">
                            Marqueur principal : {topMarker.name} ({topMarker.score}%)
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/results/${result.id}`}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-primary/20 text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Voir le rapport
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
