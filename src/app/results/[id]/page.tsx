"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RadarChartDisplay from '@/components/RadarChartDisplay';

const PdfExportButton = dynamic(() => import('@/components/PdfExportButton'), { ssr: false });
import { getResultById, getStudentById, deleteResult } from '@/lib/store';
import { AnalysisResult, Student } from '@/lib/types';
import Link from 'next/link';

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
        <p className="text-on-surface-variant font-body text-lg">Cette analyse n'existe pas ou a été supprimée.</p>
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
          <p className="text-on-surface-variant font-headline font-medium text-lg animate-pulse">Chargement du rapport cognitif...</p>
        </div>
      </div>
    );
  }

  const getRiskUI = (level: string) => {
    switch(level) {
      case 'Risque Élevé': return { class: 'text-error', bgClass: 'bg-error-container/20 text-error', text: 'Élevé' };
      case 'Risque Modéré': return { class: 'text-tertiary', bgClass: 'bg-tertiary-container/30 text-tertiary', text: 'Modéré' };
      case 'Sain': return { class: 'text-secondary', bgClass: 'bg-secondary-container/30 text-secondary', text: 'Faible' };
      default: return { class: 'text-on-surface', bgClass: 'bg-surface-variant text-on-surface-variant', text: 'Inconnu' };
    }
  };

  const riskUI = getRiskUI(data.globalRiskLevel);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Info */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-headline font-bold text-sm">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Tableau de Bord
            </Link>
            {student && (
              <>
                <span className="text-outline-variant">/</span>
                <Link href={`/students/${student.id}`} className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-headline font-bold text-sm">
                  <span className="material-symbols-outlined text-sm">history</span>
                  Historique de {student.firstName}
                </Link>
              </>
            )}
          </div>
          <h2 className="font-headline font-bold text-4xl text-on-surface tracking-tight">Rapport d'Analyse - {student.firstName} {student.lastName}</h2>
          <p className="text-on-surface-variant font-medium text-lg font-body">Analyse du {new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container text-2xl shadow-sm border border-secondary/10 shrink-0">
            {student.initials}
          </div>
        </div>
      </header>

      <div id="report-content" className="grid grid-cols-12 gap-8">
        
        {/* Risk Level Card */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest p-10 rounded-2xl flex flex-col justify-between relative overflow-hidden group shadow-sm border border-outline-variant/10 min-h-[400px]">
          <div className="relative z-10">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full font-headline text-sm font-bold mb-6 ${riskUI.bgClass}`}>
              Statut de l'Analyse
            </span>
            <h3 className="font-headline font-extrabold text-3xl mb-4 text-on-surface">Indice de Risque</h3>
            <p className="text-on-surface-variant font-body mb-8 max-w-[280px] leading-[1.8] text-lg">
              Basé sur l'évaluation complète des marqueurs phonologiques et la fluidité de lecture.
            </p>
            <div className="flex items-end gap-4 mt-auto">
              <span className={`text-6xl font-headline font-black tracking-tighter ${riskUI.class}`}>{riskUI.text}</span>
            </div>
          </div>
          
          <div className={`absolute -right-16 -bottom-16 w-80 h-80 rounded-full blur-[60px] transition-all duration-700 pointer-events-none ${data.globalRiskLevel === 'Risque Élevé' ? 'bg-error/10 group-hover:bg-error/20' : data.globalRiskLevel === 'Risque Modéré' ? 'bg-tertiary/10 group-hover:bg-tertiary/20' : 'bg-secondary/10 group-hover:bg-secondary/20'}`}></div>
          <div className="absolute right-8 top-8 opacity-[0.03] pointer-events-none">
            <span className="material-symbols-outlined text-9xl">monitoring</span>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-10 rounded-2xl flex items-center justify-center relative shadow-sm border border-outline-variant/10">
           <div className="w-full relative flex items-center justify-center h-full">
             <RadarChartDisplay data={data.markers} />
           </div>
        </div>

        {/* Transcription Card */}
        <div className={`col-span-12 ${data.handwritingImage ? 'lg:col-span-6' : ''} bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/10`}>
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <span className="material-symbols-outlined text-3xl">record_voice_over</span>
              </div>
              <h3 className="font-headline font-bold text-2xl text-on-surface">Transcription orale</h3>
           </div>
           
           <div className="p-8 bg-surface rounded-xl text-xl font-body text-on-surface leading-[2.2] tracking-wide shadow-inner border border-outline-variant/5">
              &quot;{data.transcription}&quot;
           </div>
           
           <div className="mt-8 flex flex-wrap gap-4">
             <div className="flex items-center gap-3 text-sm font-bold text-on-surface-variant font-body bg-surface-container-low px-4 py-2 rounded-lg">
               <div className="w-4 h-4 rounded-full bg-error/40 border border-error/20"></div> Anomalies de lecture
             </div>
           </div>
        </div>

        {/* Handwriting Image Card */}
        {data.handwritingImage && (
          <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <span className="material-symbols-outlined text-3xl">draw</span>
              </div>
              <h3 className="font-headline font-bold text-2xl text-on-surface">Échantillon d'écriture</h3>
            </div>
            <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-surface flex-1 flex items-center justify-center p-4">
               <img src={data.handwritingImage} alt="Écriture de l'élève" className="w-full max-h-[350px] object-contain rounded-lg shadow-sm" />
            </div>
          </div>
        )}

        {/* Detailed Markers */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-low p-10 rounded-2xl shadow-sm">
           <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
               <span className="material-symbols-outlined text-3xl">psychology</span>
             </div>
             <h3 className="font-headline font-bold text-2xl text-on-surface">Détail des Marqueurs</h3>
           </div>
           
           <div className="space-y-10">
             {data.markers.map((marker, idx) => {
                let barColor = 'bg-secondary';
                if (marker.score > 70) barColor = 'bg-error';
                else if (marker.score > 40) barColor = 'bg-tertiary';

                return (
                  <div key={idx} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="font-headline font-bold text-lg text-on-surface-variant">{marker.name}</span>
                      <span className={`text-lg font-bold ${barColor.replace('bg-', 'text-')}`}>
                        {marker.score}%
                      </span>
                    </div>
                    <div className="h-4 w-full bg-surface-variant rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${marker.score}%` }}
                      ></div>
                    </div>
                    {marker.details && marker.details.length > 0 && (
                      <ul className="mt-4 space-y-3 p-4 bg-white/50 rounded-xl border border-outline-variant/10">
                        {marker.details.map((detail, dIdx) => (
                          <li key={dIdx} className="text-base text-on-surface-variant font-body flex items-start gap-4 leading-[1.8]">
                            <span className="material-symbols-outlined text-sm mt-1.5 text-outline-variant">info</span>
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

        {/* Recommendations */}
        <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/10 shadow-sm">
           <div className="flex items-center gap-4 mb-8">
             <div className="p-3 bg-primary/10 rounded-xl text-primary">
               <span className="material-symbols-outlined text-3xl">school</span>
             </div>
             <h3 className="font-headline font-bold text-2xl text-on-surface">Recommandations IA</h3>
           </div>
           
           <div className="space-y-6">
             {data.recommendations.map((rec, idx) => (
                <div key={idx} className={`p-8 rounded-2xl border ${idx % 2 === 0 ? 'bg-secondary-container/20 border-secondary/10' : 'bg-tertiary-container/20 border-tertiary/10'} hover:shadow-md transition-shadow`}>
                  <div className="flex items-start gap-5">
                     <span className={`material-symbols-outlined text-3xl ${idx % 2 === 0 ? 'text-secondary' : 'text-tertiary'}`}>lightbulb</span>
                     <p className="text-[17px] font-body text-on-surface leading-[1.8]">{rec}</p>
                  </div>
                </div>
             ))}
             {data.recommendations.length === 0 && (
               <p className="text-on-surface-variant font-body italic p-4 text-center">Aucune recommandation spécifique générée pour cet enregistrement.</p>
             )}
           </div>
        </div>

      </div>

      {/* Floating Action Area */}
      <div className="mt-16 flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-6 py-3 border-2 border-error/20 text-error font-headline font-bold rounded-xl hover:bg-error hover:text-on-error transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          {isDeleting ? 'Suppression...' : 'Supprimer cette analyse'}
        </button>
        <PdfExportButton student={student} />
      </div>
    </div>
  );
}
