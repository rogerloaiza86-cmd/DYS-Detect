"use client";

import { useState, useEffect, useMemo } from 'react';
import { getStudents, createStudent, saveStudent, deleteStudent, getResultsByStudent } from '@/lib/store';
import { Student, RiskLevel } from '@/lib/types';
import Link from 'next/link';

const PAGE_SIZE = 10;
const RISK_LEVELS: (RiskLevel | 'Tous')[] = ['Tous', 'Risque Élevé', 'Risque Modéré', 'Sain', 'Non identifié'];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [analysisCounts, setAnalysisCounts] = useState<Record<string, number>>({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', grade: '', age: '' });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'Tous'>('Tous');
  const [gradeFilter, setGradeFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'risk' | 'date'>('name');
  const [ulisOnly, setUlisOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = async () => {
    setLoading(true);
    const list = await getStudents();
    setStudents(list);
    const counts: Record<string, number> = {};
    await Promise.all(list.map(async s => {
      counts[s.id] = (await getResultsByStudent(s.id)).length;
    }));
    setAnalysisCounts(counts);
    setLoading(false);
  };

  // Derived: unique grade list
  const grades = useMemo(() => {
    const set = new Set(students.map(s => s.grade));
    return ['Tous', ...Array.from(set).sort()];
  }, [students]);

  // ── Stats ULIS ─────────────────────────────────────────────────────────
  const ulisStudents = useMemo(() => students.filter(s => s.isUlisStudent), [students]);

  // Pending consent parmi les élèves ULIS
  const pendingConsentStudents = useMemo(
    () => ulisStudents.filter(s => s.consentStatus === 'pending' || !s.consentStatus),
    [ulisStudents]
  );

  // Derived: filtered + sorted students
  const filtered = useMemo(() => {
    const riskOrder: Record<string, number> = { 'Risque Élevé': 0, 'Risque Modéré': 1, 'Non identifié': 2, 'Sain': 3 };
    return students
      .filter(s => {
        const q = search.toLowerCase();
        const matchSearch = !q || `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.grade.toLowerCase().includes(q);
        const matchRisk = riskFilter === 'Tous' || s.riskLevel === riskFilter;
        const matchGrade = gradeFilter === 'Tous' || s.grade === gradeFilter;
        const matchUlis = !ulisOnly || s.isUlisStudent === true;
        return matchSearch && matchRisk && matchGrade && matchUlis;
      })
      .sort((a, b) => {
        if (sortBy === 'name')  return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        if (sortBy === 'age')   return a.age - b.age;
        if (sortBy === 'risk')  return (riskOrder[a.riskLevel] ?? 4) - (riskOrder[b.riskLevel] ?? 4);
        if (sortBy === 'date')  return (b.lastAnalysisDate ?? '').localeCompare(a.lastAnalysisDate ?? '');
        return 0;
      });
  }, [students, search, riskFilter, gradeFilter, sortBy, ulisOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, riskFilter, gradeFilter, sortBy, ulisOnly]);

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName || !form.grade || !form.age) return;
    const age = parseInt(form.age, 10);
    if (age < 3 || age > 18) { alert("L'âge doit être compris entre 3 et 18 ans."); return; }
    await createStudent(form.firstName.trim(), form.lastName.trim(), form.grade.trim(), age);
    setForm({ firstName: '', lastName: '', grade: '', age: '' });
    setShowForm(false);
    loadStudents();
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setForm({ firstName: student.firstName, lastName: student.lastName, grade: student.grade, age: String(student.age) });
  };

  const handleSaveEdit = async (student: Student) => {
    if (!form.firstName || !form.lastName || !form.grade || !form.age) return;
    const age = parseInt(form.age, 10);
    if (age < 3 || age > 18) { alert("L'âge doit être compris entre 3 et 18 ans."); return; }
    await saveStudent({
      ...student,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      initials: (form.firstName[0] + form.lastName[0]).toUpperCase(),
      grade: form.grade.trim(),
      age,
    });
    setEditingId(null);
    setForm({ firstName: '', lastName: '', grade: '', age: '' });
    loadStudents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer l'élève "${name}" ? Cette action est irréversible.`)) return;
    await deleteStudent(id);
    loadStudents();
  };

  const badgeClass = (level: string) => {
    if (level === 'Risque Élevé') return 'bg-error-container/20 text-error border border-error/10';
    if (level === 'Risque Modéré') return 'bg-tertiary-container/30 text-tertiary border border-tertiary/10';
    if (level === 'Sain') return 'bg-secondary-container/30 text-secondary border border-secondary/10';
    return 'bg-surface-variant text-on-surface-variant border border-outline-variant/20';
  };

  const hasActiveFilters = search || riskFilter !== 'Tous' || gradeFilter !== 'Tous' || ulisOnly;

  return (
    <div className="max-w-6xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-3 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Tableau de bord
          </Link>
          <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Gestion des Élèves</h2>
          <p className="text-on-surface-variant font-body mt-1">
            {filtered.length} élève{filtered.length !== 1 ? 's' : ''} {hasActiveFilters ? 'filtrés' : 'enregistrés'}
            {students.length !== filtered.length && ` sur ${students.length}`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ firstName: '', lastName: '', grade: '', age: '' }); }}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold shadow-md hover:bg-primary-dim transition-all hover:scale-[1.03] active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined">add</span>
          Ajouter un élève
        </button>
      </div>

      {/* Bandeau stats ULIS */}
      {ulisStudents.length > 0 && (
        <div className="bg-[#8b5cf6]/5 rounded-2xl border border-[#8b5cf6]/20 p-5">
          <div className="flex flex-wrap items-center gap-6">
            {/* Total ULIS */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#8b5cf6] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-wide">Élèves ULIS</p>
                <p className="font-headline font-bold text-2xl text-on-surface">{ulisStudents.length}</p>
              </div>
            </div>

            <div className="w-px h-10 bg-outline-variant/20 hidden sm:block" />

            {/* Alerte consentements en attente */}
            {pendingConsentStudents.length > 0 && (
              <button
                onClick={() => { setUlisOnly(true); setRiskFilter('Tous'); setSearch(''); setGradeFilter('Tous'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary font-headline font-bold text-sm hover:bg-tertiary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                {pendingConsentStudents.length} consentement{pendingConsentStudents.length > 1 ? 's' : ''} en attente
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-on-surface-variant font-body italic">Pôle ULIS activé</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 rounded-full text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Actif
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-secondary">
              <span className="material-symbols-outlined text-2xl">person_add</span>
              <h3 className="font-headline font-bold text-lg text-on-surface">Nouvel élève</h3>
            </div>
            <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Prénom', 'Nom', 'Classe (ex: CM1-A)', 'Âge'].map((ph, i) => (
              <input
                key={ph}
                placeholder={ph}
                type={i === 3 ? 'number' : 'text'}
                min={i === 3 ? '3' : undefined}
                max={i === 3 ? '18' : undefined}
                value={[form.firstName, form.lastName, form.grade, form.age][i]}
                onChange={e => setForm(f => ({ ...f, [['firstName','lastName','grade','age'][i]]: e.target.value }))}
                className="p-3 rounded-xl border border-outline-variant/30 bg-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            ))}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={!form.firstName || !form.lastName || !form.grade || !form.age}
              className="flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-dim transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">check</span>
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
            <input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Risk filter */}
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value as RiskLevel | 'Tous')}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            {RISK_LEVELS.map(r => <option key={r} value={r}>{r === 'Tous' ? 'Tous les risques' : r}</option>)}
          </select>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            {grades.map(g => <option key={g} value={g}>{g === 'Tous' ? 'Toutes les classes' : g}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/30 bg-surface text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          >
            <option value="name">Trier : Nom</option>
            <option value="age">Trier : Âge</option>
            <option value="risk">Trier : Risque</option>
            <option value="date">Trier : Date analyse</option>
          </select>

          {/* Toggle ULIS */}
          {ulisStudents.length > 0 && (
            <button
              onClick={() => setUlisOnly(v => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border font-body text-sm transition-all ${
                ulisOnly
                  ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6] font-bold'
                  : 'border-outline-variant/30 text-on-surface-variant hover:border-[#8b5cf6]/30 hover:text-[#8b5cf6]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: ulisOnly ? "'FILL' 1" : "'FILL' 0" }}>school</span>
              ULIS uniquement
            </button>
          )}

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setRiskFilter('Tous'); setGradeFilter('Tous'); setUlisOnly(false); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-error hover:border-error/30 font-body text-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/80 z-10 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="font-body text-sm text-on-surface-variant">Chargement...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20">
                {['Élève', 'Classe', 'Âge', 'Analyses', 'Statut', 'Actions'].map((h, i) => (
                  <th key={h} className={`py-4 px-4 font-headline font-bold text-xs tracking-widest text-on-surface-variant uppercase ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {paginated.map(student => {
                const isEditing = editingId === student.id;
                const count = analysisCounts[student.id] ?? 0;

                if (isEditing) return (
                  <tr key={student.id} className="bg-primary/5">
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="p-2 rounded-lg border border-outline-variant/30 bg-surface text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                        <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="p-2 rounded-lg border border-outline-variant/30 bg-surface text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      </div>
                    </td>
                    <td className="py-3 px-4"><input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="p-2 rounded-lg border border-outline-variant/30 bg-surface text-sm w-24 focus:outline-none focus:ring-2 focus:ring-primary/50" /></td>
                    <td className="py-3 px-4"><input type="number" min="3" max="18" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="p-2 rounded-lg border border-outline-variant/30 bg-surface text-sm w-16 focus:outline-none focus:ring-2 focus:ring-primary/50" /></td>
                    <td className="py-3 px-4 text-on-surface-variant text-sm">{count}</td>
                    <td className="py-3 px-4"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badgeClass(student.riskLevel)}`}>{student.riskLevel}</span></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleSaveEdit(student)} className="p-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary hover:text-on-secondary transition-colors"><span className="material-symbols-outlined text-[18px]">check</span></button>
                        <button onClick={() => { setEditingId(null); setForm({ firstName: '', lastName: '', grade: '', age: '' }); }} className="p-2 bg-surface-variant text-on-surface-variant rounded-lg hover:bg-error hover:text-on-error transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                      </div>
                    </td>
                  </tr>
                );

                return (
                  <tr key={student.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-4 px-4">
                      <Link href={`/students/${student.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm">{student.initials}</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-headline font-bold text-on-surface">{student.firstName} {student.lastName}</span>
                          {student.isUlisStudent && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20 rounded-full text-[10px] font-bold">
                              ULIS
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant">{student.grade}</td>
                    <td className="py-4 px-4 text-on-surface-variant">{student.age} ans</td>
                    <td className="py-4 px-4 text-on-surface-variant font-medium">{count}</td>
                    <td className="py-4 px-4"><span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${badgeClass(student.riskLevel)}`}>{student.riskLevel}</span></td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/students/${student.id}`} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Historique"><span className="material-symbols-outlined text-[18px]">history</span></Link>
                        <button onClick={() => handleEdit(student)} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Modifier"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <button onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" title="Supprimer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-on-surface-variant font-body">Aucun élève ne correspond aux filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/30">
            <p className="text-sm text-on-surface-variant font-body">
              Page {page} sur {totalPages} · {filtered.length} élève{filtered.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-headline font-bold text-sm transition-all ${p === page ? 'bg-primary text-on-primary shadow-sm' : 'border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
