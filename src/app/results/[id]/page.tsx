"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RadarChartDisplay from '@/components/RadarChartDisplay';

const PdfExportButton = dynamic(() => import('@/components/PdfExportButton'), { ssr: false });
import { getResultById, getStudentById, deleteResult } from '@/lib/store';
import { AnalysisResult, Student, DisorderCategory, RiskLevel, ANALYSIS_MODES } from '@/lib/types';
import { exportESS } from '@/lib/export-ess';
import Link from 'next/link';

const DISORDER_COLORS: Record<DisorderCategory, { bg: string; text: string; border: string; label: string }> = {
  DYS:  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', label: 'Troubles DYS' },
  TDAH: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', label: 'TDAH' },
  TSA:  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', label: 'TSA' },
};

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette analyse ? Cette action est irréversible.")) return;
    setIsDeleting(true);
    await deleteResult(id);
    router.push(student ? `/students/${student.id}` : '/');
  };

  useEffect(() => {
    getResultById(id).then(result => {
      if (!result) { setNotFound(true); return; }
      setData(result);
      getStudentById(result.studentId).then(s => setStudent(s));
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <span className="material-symbols-outlined text-error text-6xl shadow-sm">error</span>
        <h2 className="text-3xl font-headline font-bold text-on-surface">Résultat introuvable</h2>
        <p className="text-on-surface-variant font-body text-lg">Cette analyse n&apos;existe pas ou a été supprimée.</p>
        <Link href="/" className="mt-6 flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold hover:bg-primary-dim transition-colors shadow-lg hover:scale-105 active:scale-95">
          <span className="material-symbols-outlined">arrow_back</span>
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  if (!data || !student) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-headline font-medium text-lg animate-pulse">Chargement du rapport...</p>
        </div>
      </div>
    );
  }

  const getRiskUI = (level: string) => {
    switch(level) {
      case 'Risque Élevé': return { class: 'text-error', bgClass: 'bg-error-container/20 text-error', text: 'Élevé' };
      case 'Risque Modéré': return { class: 'text-tertiary', bgClass: 'bg-tertiary-container/30 text-tertiary', text: 'Modéré' };
      case 'Sain': case 'Faible Risque': return { class: 'text-secondary', bgClass: 'bg-secondary-container/30 text-secondary', text: 'Faible' };
      default: return { class: 'text-on-surface', bgClass: 'bg-surface-variant text-on-surface-variant', text: 'Inconnu' };
    }
  };

  const riskUI = getRiskUI(data.globalRiskLevel);

  // Group markers by disorder category
  const markersByCategory = (data.markers || []).reduce<Record<string, typeof data.markers>>((acc, m) => {
    const cat = m.category || 'DYS';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const modeConfig = ANALYSIS_MODES.find(m => m.id === data.analysisMode);
  const hasScreening = data.disorderScreening && Object.keys(data.disorderScreening).length > 0;

  // TDAH 3-subtype logic (Pan et al., JAMA Psychiatry 2026)
  const tdahMarkers = (data.markers || []).filter(m => m.category === 'TDAH');
  const emotionnelScore = tdahMarkers.find(m => m.subcategory === 'emotionnel')?.score ?? 0;
  const impulsifScore = tdahMarkers.find(m => m.subcategory === 'impulsif')?.score ?? 0;
  const inattentifScore = tdahMarkers.find(m => m.subcategory === 'inattentif')?.score ?? 0;
  const hasTdahSubtypes = emotionnelScore > 0 || impulsifScore > 0 || inattentifScore > 0;
  const tdahRisk = data.disorderScreening?.TDAH;
  const showTdahCard =
    hasTdahSubtypes ||
    tdahRisk === 'Risque Modéré' ||
    tdahRisk === 'Risque Élevé';
  const dominantSubtype = [
    { type: 'emotionnel', score: emotionnelScore },
    { type: 'impulsif', score: impulsifScore },
    { type: 'inattentif', score: inattentifScore },
  ].sort((a, b) => b.score - a.score)[0];

  const TDAH_SUBTYPE_CONFIG = {
    emotionnel: {
      icon: '🌊',
      label: 'Émotionnel',
      zone: 'Cortex préfrontal ventromédian',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      score: emotionnelScore,
      description: 'Instabilité émotionnelle, colères, agressivité — cortex préfrontal ventromédian',
    },
    impulsif: {
      icon: '⚡',
      label: 'Impulsif',
      zone: 'Cortex cingulaire antérieur',
      barColor: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      score: impulsifScore,
      description: 'Agitation, parole précipitée, difficulté à attendre — cortex cingulaire antérieur',
    },
    inattentif: {
      icon: '🌫️',
      label: 'Inattentif',
      zone: 'Réseau du mode par défaut',
      barColor: 'bg-indigo-500',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      score: inattentifScore,
      description: 'Inattention sans hyperactivité, discret — souvent non détecté chez les filles',
    },
  } as const;

  // ─── Differential Analysis ─────────────────────────────────────────────
  // Computes average score per top-level disorder category
  const catAvgScore = (cat: DisorderCategory): number => {
    const scores = (data.markers || [])
      .filter(m => m.category === cat)
      .map(m => m.score);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const categoryScores: { cat: DisorderCategory; avg: number }[] = (
    ['DYS', 'TDAH', 'TSA'] as DisorderCategory[]
  )
    .map(cat => ({ cat, avg: catAvgScore(cat) }))
    .filter(x => x.avg > 40)
    .sort((a, b) => b.avg - a.avg);

  const showDifferential = categoryScores.length >= 2;

  // Build discriminating markers between the top 2 categories
  const differentialPairs: {
    markerName: string;
    scores: { cat: DisorderCategory; score: number }[];
    diff: number;
  }[] = [];

  if (showDifferential) {
    const top2 = categoryScores.slice(0, 2).map(x => x.cat);
    const markerNameSet = new Set<string>();
    for (const m of data.markers || []) {
      if (top2.includes(m.category as DisorderCategory)) markerNameSet.add(m.name);
    }
    for (const name of markerNameSet) {
      const entry: { cat: DisorderCategory; score: number }[] = [];
      for (const cat of top2) {
        const found = (data.markers || []).find(m => m.name === name && m.category === cat);
        if (found) entry.push({ cat, score: found.score });
      }
      if (entry.length === 2) {
        differentialPairs.push({
          markerName: name,
          scores: entry,
          diff: Math.abs(entry[0].score - entry[1].score),
        });
      }
    }
    differentialPairs.sort((a, b) => b.diff - a.diff);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-headline font-bold text-sm">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Dashboard
            </Link>
            {student && (
              <>
                <span className="text-outline-variant">/</span>
                <Link href={`/students/${student.id}`} className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-headline font-bold text-sm">
                  <span className="material-symbols-outlined text-sm">history</span>
                  {student.firstName}
                </Link>
              </>
            )}
          </div>
          <h2 className="font-headline font-bold text-3xl lg:text-4xl text-on-surface tracking-tight">
            Rapport - {student.firstName} {student.lastName}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-on-surface-variant font-medium text-base font-body">
              {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {modeConfig && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-headline font-bold">
                <span className="material-symbols-outlined text-sm">{modeConfig.icon}</span>
                {modeConfig.label}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => exportESS(student, data)}
            className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-high text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-all text-sm border border-outline-variant/20"
            title="Exporter le document ESS"
          >
            <span className="material-symbols-outlined text-lg">description</span>
            Export ESS
          </button>
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-2xl shadow-sm border border-secondary/10 shrink-0">
            {student.initials}
          </div>
        </div>
      </header>

      {/* Legal disclaimer — always visible */}
      <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl text-sm">
        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0 mt-0.5">info</span>
        <p className="text-amber-800 dark:text-amber-300 font-body leading-relaxed">
          <span className="font-bold">Outil d&apos;aide au repérage précoce.</span> Les indicateurs présentés ci-dessous sont générés par intelligence artificielle à des fins d&apos;orientation pédagogique. Ils ne constituent pas une évaluation clinique et ne remplacent pas l&apos;avis d&apos;un professionnel de santé (orthophoniste, neuropsychologue, médecin). En cas de doute, orientez l&apos;élève vers un bilan spécialisé.
        </p>
      </div>

      <div id="report-content" className="grid grid-cols-12 gap-6">

        {/* Disorder Screening Cards (if multi-trouble) */}
        {hasScreening && (
          <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.entries(data.disorderScreening!) as [DisorderCategory, RiskLevel][]).map(([disorder, risk]) => {
              const dc = DISORDER_COLORS[disorder];
              const rUI = getRiskUI(risk);
              return (
                <div key={disorder} className={`p-5 rounded-xl border ${dc.border} ${dc.bg} flex items-center justify-between`}>
                  <div>
                    <p className={`text-xs font-headline font-bold uppercase tracking-wider ${dc.text}`}>{dc.label}</p>
                    <p className={`text-2xl font-headline font-black mt-1 ${rUI.class}`}>{rUI.text}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    risk === 'Risque Élevé' ? 'bg-error/20' : risk === 'Risque Modéré' ? 'bg-tertiary/20' : 'bg-secondary/20'
                  }`}>
                    <span className={`material-symbols-outlined text-2xl ${rUI.class}`}>
                      {risk === 'Risque Élevé' ? 'warning' : risk === 'Risque Modéré' ? 'info' : 'check_circle'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TDAH Subtype Card (Pan et al., JAMA Psychiatry 2026) */}
        {showTdahCard && (
          <div className="col-span-12 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-2xl">neurology</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Profil TDAH — Classification neurologique</h3>
                <p className="text-xs text-on-surface-variant font-body">Pan et al., JAMA Psychiatry 2026</p>
              </div>
              {dominantSubtype && dominantSubtype.score > 0 && (
                <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-headline font-bold ${TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].bgColor} ${TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].textColor}`}>
                  {TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].icon}
                  Profil dominant : {TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].label}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {(['emotionnel', 'impulsif', 'inattentif'] as const).map(type => {
                const cfg = TDAH_SUBTYPE_CONFIG[type];
                return (
                  <div key={type} className={`flex items-center gap-4 p-4 rounded-xl ${cfg.bgColor}`}>
                    <span className="text-2xl shrink-0">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <span className={`font-headline font-bold text-base ${cfg.textColor}`}>{cfg.label}</span>
                        <span className="text-xs text-on-surface-variant font-body truncate">{cfg.zone}</span>
                      </div>
                      <div className="h-2.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.barColor} transition-all duration-1000 ease-out`}
                          style={{ width: `${cfg.score}%` }}
                        />
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center justify-center w-12 h-8 rounded-lg font-headline font-black text-sm ${cfg.textColor} ${cfg.bgColor} border border-current/20`}>
                      {cfg.score}
                    </span>
                  </div>
                );
              })}
            </div>

            {dominantSubtype && dominantSubtype.score > 0 && (
              <div className={`mt-5 p-4 rounded-xl border ${TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].bgColor} border-current/10`}>
                <p className={`text-sm font-body leading-relaxed ${TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].textColor}`}>
                  <span className="font-bold">Description clinique :</span>{' '}
                  {TDAH_SUBTYPE_CONFIG[dominantSubtype.type as keyof typeof TDAH_SUBTYPE_CONFIG].description}
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-on-surface-variant font-body italic">
              Basé sur l&apos;analyse de centaines d&apos;IRM cérébrales (Pan et al., JAMA Psychiatry 2026)
            </p>
          </div>
        )}

        {/* Global Risk + Radar */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm border border-outline-variant/10 min-h-[380px]">
          <div className="relative z-10">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full font-headline text-sm font-bold mb-6 ${riskUI.bgClass}`}>
              Risque Global
            </span>
            <h3 className="font-headline font-extrabold text-3xl mb-4 text-on-surface">Indice de Risque</h3>
            <p className="text-on-surface-variant font-body mb-8 max-w-[280px] leading-relaxed">
              {hasScreening
                ? "Évaluation multi-troubles basée sur l'analyse combinée DYS, TDAH et TSA."
                : "Basé sur l'évaluation des marqueurs phonologiques et la fluidité de lecture."
              }
            </p>
            <div className="flex items-end gap-4 mt-auto">
              <span className={`text-6xl font-headline font-black tracking-tighter ${riskUI.class}`}>{riskUI.text}</span>
            </div>
          </div>
          <div className={`absolute -right-16 -bottom-16 w-80 h-80 rounded-full blur-[60px] transition-all duration-700 pointer-events-none ${data.globalRiskLevel === 'Risque Élevé' ? 'bg-error/10' : data.globalRiskLevel === 'Risque Modéré' ? 'bg-tertiary/10' : 'bg-secondary/10'}`} />
        </div>

        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl flex items-center justify-center shadow-sm border border-outline-variant/10">
          <div className="w-full relative flex items-center justify-center h-full">
            <RadarChartDisplay data={data.markers} />
          </div>
        </div>

        {/* Audio Metadata Card (if present) */}
        {data.audioMetadata && (
          <div className="col-span-12 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-2xl">graphic_eq</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Caractéristiques Audio</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Durée', value: `${Math.round(data.audioMetadata.totalDurationMs / 1000)}s`, icon: 'timer' },
                { label: 'Pauses', value: data.audioMetadata.pauseCount.toString(), icon: 'pause_circle' },
                { label: 'Pause max', value: `${Math.round(data.audioMetadata.maxPauseDurationMs / 1000)}s`, icon: 'hourglass_top' },
                { label: 'Mots/min', value: Math.round(data.audioMetadata.wordsPerMinute).toString(), icon: 'speed' },
                { label: 'Prosodie', value: data.audioMetadata.pitchVariance === 'low' ? 'Monotone' : data.audioMetadata.pitchVariance === 'high' ? 'Variable' : 'Normal', icon: 'equalizer' },
                { label: 'Rythme', value: data.audioMetadata.rhythmRegularity === 'regular' ? 'Régulier' : data.audioMetadata.rhythmRegularity === 'very_irregular' ? 'Très irrég.' : 'Irrégulier', icon: 'music_note' },
              ].map(item => (
                <div key={item.label} className="p-4 bg-surface rounded-xl border border-outline-variant/10 text-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl mb-2 block">{item.icon}</span>
                  <p className="text-lg font-headline font-bold text-on-surface">{item.value}</p>
                  <p className="text-xs text-on-surface-variant">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcription */}
        <div className={`col-span-12 ${data.handwritingImage ? 'lg:col-span-6' : ''} bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm border border-outline-variant/10`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <span className="material-symbols-outlined text-2xl">record_voice_over</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Transcription</h3>
          </div>
          <div className="p-6 bg-surface rounded-xl text-base font-body text-on-surface leading-relaxed shadow-inner border border-outline-variant/5">
            &quot;{data.transcription}&quot;
          </div>
        </div>

        {/* Handwriting Image */}
        {data.handwritingImage && (
          <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-8 lg:p-10 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <span className="material-symbols-outlined text-2xl">draw</span>
              </div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Écriture</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-surface flex-1 flex items-center justify-center p-4">
              <img src={data.handwritingImage} alt="Écriture" className="w-full max-h-[300px] object-contain rounded-lg" />
            </div>
          </div>
        )}

        {/* Markers by Category */}
        {Object.entries(markersByCategory).map(([category, markers]) => {
          const dc = DISORDER_COLORS[category as DisorderCategory] || DISORDER_COLORS.DYS;
          return (
            <div key={category} className="col-span-12 lg:col-span-6 bg-surface-container-low p-8 lg:p-10 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${dc.bg}`}>
                  <span className={`material-symbols-outlined text-2xl ${dc.text}`}>psychology</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface">{dc.label}</h3>
                  {data.disorderScreening && data.disorderScreening[category as DisorderCategory] && (
                    <span className={`text-xs font-bold ${getRiskUI(data.disorderScreening[category as DisorderCategory]).class}`}>
                      {data.disorderScreening[category as DisorderCategory]}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                {markers.map((marker, idx) => {
                  let barColor = 'bg-secondary';
                  if (marker.score > 70) barColor = 'bg-error';
                  else if (marker.score > 40) barColor = 'bg-tertiary';

                  const isTdahSubtype =
                    category === 'TDAH' &&
                    (marker.subcategory === 'emotionnel' || marker.subcategory === 'impulsif' || marker.subcategory === 'inattentif');
                  const tdahSubtypeCfg = isTdahSubtype
                    ? TDAH_SUBTYPE_CONFIG[marker.subcategory as 'emotionnel' | 'impulsif' | 'inattentif']
                    : null;

                  return (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-end">
                        {isTdahSubtype && tdahSubtypeCfg ? (
                          <span className={`font-headline font-bold text-base ${tdahSubtypeCfg.textColor} flex items-center gap-1.5`}>
                            <span>{tdahSubtypeCfg.icon}</span>
                            {tdahSubtypeCfg.label}
                          </span>
                        ) : (
                          <span className="font-headline font-bold text-base text-on-surface-variant">{marker.name}</span>
                        )}
                        <span className={`text-base font-bold ${barColor.replace('bg-', 'text-')}`}>{marker.score}%</span>
                      </div>
                      <div className="h-3 w-full bg-surface-variant rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} style={{ width: `${marker.score}%` }} />
                      </div>
                      {marker.details && marker.details.length > 0 && (
                        <ul className="mt-2 space-y-2 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-outline-variant/10">
                          {marker.details.map((detail, dIdx) => (
                            <li key={dIdx} className="text-sm text-on-surface-variant font-body flex items-start gap-3 leading-relaxed">
                              <span className="material-symbols-outlined text-xs mt-1 text-outline-variant">info</span>
                              <span className="flex-1">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Differential Analysis */}
        {showDifferential && (
          <div className="col-span-12 bg-surface-container-lowest p-8 rounded-2xl border-2 border-purple-300 dark:border-purple-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined text-2xl">search</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">Analyse différentielle</h3>
                <p className="text-xs text-on-surface-variant font-body mt-0.5">
                  Marqueurs discriminants entre{' '}
                  {categoryScores.slice(0, 2).map((x, i) => (
                    <span key={x.cat}>
                      {i > 0 && ' et '}
                      <span className={`font-bold ${DISORDER_COLORS[x.cat].text}`}>{DISORDER_COLORS[x.cat].label}</span>
                      {' '}({Math.round(x.avg)}%)
                    </span>
                  ))}
                </p>
              </div>
            </div>

            {differentialPairs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/10">
                      <th className="text-left p-3 font-headline font-bold text-on-surface">Marqueur</th>
                      {categoryScores.slice(0, 2).map(x => (
                        <th key={x.cat} className={`text-center p-3 font-headline font-bold ${DISORDER_COLORS[x.cat].text}`}>
                          {DISORDER_COLORS[x.cat].label}
                        </th>
                      ))}
                      <th className="text-center p-3 font-headline font-bold text-purple-600 dark:text-purple-400">Écart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {differentialPairs.slice(0, 8).map((pair, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-container-lowest'}>
                        <td className="p-3 font-body text-on-surface">{pair.markerName}</td>
                        {pair.scores.map(({ cat, score }) => {
                          const isMax = score === Math.max(...pair.scores.map(s => s.score));
                          return (
                            <td key={cat} className={`p-3 text-center font-mono font-bold ${isMax ? 'text-error' : 'text-secondary'}`}>
                              {score}%
                              {isMax && <span className="material-symbols-outlined text-xs ml-1 align-middle">arrow_upward</span>}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                          {pair.diff} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-on-surface-variant font-body italic text-sm">
                Aucun marqueur en commun entre les deux catégories pour établir une comparaison directe.
              </p>
            )}

            <p className="mt-4 text-xs text-on-surface-variant font-body italic">
              Un écart important entre les scores d&apos;un même marqueur suggère une orientation préférentielle.
              Cette analyse doit être confirmée par un professionnel de santé.
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className={`col-span-12 ${Object.keys(markersByCategory).length % 2 !== 0 ? 'lg:col-span-6' : ''} bg-surface-container-lowest p-8 lg:p-10 rounded-2xl border border-outline-variant/10 shadow-sm`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface">Recommandations IA</h3>
          </div>

          <div className="space-y-4">
            {data.recommendations.map((rec, idx) => (
              <div key={idx} className={`p-6 rounded-xl border ${idx % 2 === 0 ? 'bg-secondary-container/20 border-secondary/10' : 'bg-tertiary-container/20 border-tertiary/10'} hover:shadow-md transition-shadow`}>
                <div className="flex items-start gap-4">
                  <span className={`material-symbols-outlined text-2xl ${idx % 2 === 0 ? 'text-secondary' : 'text-tertiary'}`}>lightbulb</span>
                  <p className="text-base font-body text-on-surface leading-relaxed">{rec}</p>
                </div>
              </div>
            ))}
            {data.recommendations.length === 0 && (
              <p className="text-on-surface-variant font-body italic p-4 text-center">Aucune recommandation.</p>
            )}
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-6 py-3 border-2 border-error/20 text-error font-headline font-bold rounded-xl hover:bg-error hover:text-on-error transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          {isDeleting ? 'Suppression...' : 'Supprimer'}
        </button>
        <PdfExportButton student={student} />
      </div>
    </div>
  );
}
