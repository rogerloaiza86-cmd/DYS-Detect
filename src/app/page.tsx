"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStudents, getResults, getProfile } from "@/lib/store";
import { Student, AnalysisResult, UserProfile } from "@/lib/types";
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    Promise.all([getStudents(), getResults()]).then(([s, r]) => {
      setStudents(s);
      setResults(r);
    });
    setProfile(getProfile());
  }, []);

  const totalStudents = students.length;
  const highRisk = students.filter(s => s.riskLevel === 'Risque Élevé').length;
  const totalAnalyses = results.length;

  const getLastResultId = (studentId: string): string | null => {
    const studentResults = results.filter(r => r.studentId === studentId);
    if (studentResults.length === 0) return null;
    return studentResults[studentResults.length - 1].id;
  };

  return (
    <>
      {/* Welcome Header */}
      <header className="mb-12">
        <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">Bienvenue, {profile ? `${profile.firstName} ${profile.lastName}` : '...'}</h2>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-primary">calendar_today</span>
          <p className="font-body text-lg font-medium">Il y a actuellement <span className="text-primary font-bold">{totalAnalyses} analyses</span> réalisées.</p>
        </div>
      </header>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-container rounded-lg text-on-secondary-container">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium mb-1">Total Élèves</h3>
          <p className="font-headline text-4xl font-bold text-on-surface">{totalStudents}</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-error-container/20 rounded-lg text-error">
              <span className="material-symbols-outlined text-3xl">priority_high</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium mb-1">Risque Élevé</h3>
          <p className="font-headline text-4xl font-bold text-on-surface">{highRisk}</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-primary-container/20 rounded-lg text-primary">
              <span className="material-symbols-outlined text-3xl">neurology</span>
            </div>
          </div>
          <h3 className="text-on-surface-variant font-label font-medium mb-1">Total Analyses</h3>
          <p className="font-headline text-4xl font-bold text-on-surface">{totalAnalyses}</p>
        </div>
      </div>

      {/* Main Section: Recent Students */}
      <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="p-8 flex justify-between items-center bg-surface-container-low/30 border-b border-outline-variant/10">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Élèves Récents</h3>
          <Link href="/students" className="text-primary font-headline font-bold text-sm hover:underline transition-all">Tout voir</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="px-8 py-4 font-headline text-sm font-bold text-on-surface-variant">Nom</th>
                <th className="px-8 py-4 font-headline text-sm font-bold text-on-surface-variant">Classe</th>
                <th className="px-8 py-4 font-headline text-sm font-bold text-on-surface-variant">Âge</th>
                <th className="px-8 py-4 font-headline text-sm font-bold text-on-surface-variant">Statut de risque</th>
                <th className="px-8 py-4 font-headline text-sm font-bold text-on-surface-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {students.slice(0, 5).map((student) => {
                let badgeClass = "";
                let indicatorColor = "";
                
                switch (student.riskLevel) {
                  case 'Risque Élevé':
                    badgeClass = "bg-error-container/20 text-error";
                    indicatorColor = "bg-error";
                    break;
                  case 'Risque Modéré':
                    badgeClass = "bg-tertiary-container/30 text-tertiary";
                    indicatorColor = "bg-tertiary";
                    break;
                  case 'Sain':
                  default:
                    badgeClass = "bg-secondary-container/30 text-secondary";
                    indicatorColor = "bg-secondary";
                }

                const lastResultId = getLastResultId(student.id);

                return (
                  <tr key={student.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {student.initials}
                        </div>
                        <Link href={`/students/${student.id}`} className="font-headline font-bold text-on-surface hover:text-primary transition-colors">{student.firstName} {student.lastName}</Link>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant font-medium">{student.grade}</td>
                    <td className="px-8 py-5 text-on-surface-variant font-medium">{student.age} ans</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold ${badgeClass}`}>
                        <span className={`w-2 h-2 rounded-full ${indicatorColor}`}></span>
                        {student.riskLevel}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {lastResultId ? (
                        <button
                          onClick={() => router.push(`/results/${lastResultId}`)}
                          className="px-6 py-2 border-2 border-primary/10 text-primary font-headline font-bold rounded-full hover:bg-primary hover:text-on-primary transition-all active:scale-95"
                        >
                          Voir l'analyse
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push('/new-analysis')}
                          className="px-6 py-2 border-2 border-outline-variant/20 text-on-surface-variant font-headline font-bold rounded-full hover:bg-surface-variant transition-all active:scale-95"
                        >
                          Analyser
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                    Aucun élève enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dynamic Insights */}
      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-primary/5 p-8 rounded-xl border-2 border-primary/10 flex items-center gap-6">
          <div className="p-4 bg-primary rounded-2xl text-on-primary">
            <span className="material-symbols-outlined text-4xl">lightbulb</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-primary text-xl mb-1">Aperçu Hebdomadaire</h4>
            <p className="text-on-surface-variant font-body">Pensez à faire passer les tests d'évaluation périodiques cette semaine.</p>
          </div>
        </div>
        <div className="bg-secondary-container/20 p-8 rounded-xl border-2 border-secondary/10 flex items-center gap-6">
          <div className="p-4 bg-secondary rounded-2xl text-on-secondary">
            <span className="material-symbols-outlined text-4xl">task_alt</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-secondary text-xl mb-1">Actions suggérées</h4>
            <p className="text-on-surface-variant font-body">{highRisk} élèves nécessitent une attention particulière.</p>
          </div>
        </div>
      </section>
    </>
  );
}
