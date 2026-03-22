"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStudentById, getResultsByStudent } from '@/lib/store';
import { Student, AnalysisResult } from '@/lib/types';

export default function StudentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([getStudentById(id), getResultsByStudent(id)]).then(([s, r]) => {
      if (!s) { setNotFound(true); setLoading(false); return; }
      setStudent(s);
      setResults([...r].reverse()); // newest first
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
              <h1 className="font-headline font-black text-4xl text-on-surface tracking-tight">
                {student.firstName} {student.lastName}
              </h1>
              <p className="text-on-surface-variant font-body text-lg mt-1">
                {student.grade} · {student.age} ans
              </p>
            </div>
          </div>
          <Link
            href="/new-analysis"
            className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
            Nouvelle analyse
          </Link>
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
