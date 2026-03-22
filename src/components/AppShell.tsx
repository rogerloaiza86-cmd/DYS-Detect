"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import UserProfileHeader from '@/components/UserProfileHeader';
import { getStudents, getResultsByStudent, hasCompletedOnboarding } from '@/lib/store';
import { Student, UserProfile } from '@/lib/types';
import OnboardingModal from '@/components/OnboardingModal';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/new-analysis', label: 'Nouvelle Analyse', icon: 'mic' },
  { href: '/students', label: 'Élèves', icon: 'groups' },
  { href: '/help', label: 'Aide', icon: 'help_outline' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── Init ───────────────────────────────────────────────────
  useEffect(() => {
    setShowOnboarding(!hasCompletedOnboarding());
    getStudents().then(setAllStudents);

    // Dark mode
    const saved = localStorage.getItem('dys-detect-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved !== null ? saved === 'true' : prefersDark;
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Apply dark class on toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('dys-detect-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close notifications on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search ─────────────────────────────────────────────────
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = query.toLowerCase().trim();
    const filtered = allStudents.filter(s =>
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
    setShowResults(true);
  }, [allStudents]);

  const handleSelectStudent = async (student: Student) => {
    setSearchQuery('');
    setShowResults(false);
    const results = await getResultsByStudent(student.id);
    if (results.length > 0) {
      router.push(`/results/${results[results.length - 1].id}`);
    } else {
      router.push(`/new-analysis`);
    }
  };

  // ── Onboarding ─────────────────────────────────────────────
  const handleOnboardingComplete = (profile: UserProfile) => {
    setShowOnboarding(false);
    getStudents().then(setAllStudents);
    router.refresh();
  };

  // ── Notifications ──────────────────────────────────────────
  const highRisk = allStudents.filter(s => s.riskLevel === 'Risque Élevé');
  const unanalyzed = allStudents.filter(s => s.riskLevel === 'Non identifié');
  const notifCount = highRisk.length + unanalyzed.length;

  const riskBadge = (level: string) => {
    if (level === 'Risque Élevé') return 'bg-error-container/20 text-error';
    if (level === 'Risque Modéré') return 'bg-tertiary-container/30 text-tertiary';
    if (level === 'Sain') return 'bg-secondary-container/30 text-secondary';
    return 'bg-surface-variant text-on-surface-variant';
  };

  return (
    <>
      {/* ── Mobile overlay ───────────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SideNavBar ───────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 w-64 flex flex-col p-6 gap-8 bg-surface-container-low border-r border-outline-variant/10 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col gap-1">
          <h1 className="font-headline font-extrabold text-2xl bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent">DYS-Detect</h1>
          <p className="font-headline text-xs text-on-surface-variant tracking-wider uppercase opacity-70">The Empathetic Path</p>
        </div>

        <nav className="flex flex-col gap-2 mt-4">
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-xl ${
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:scale-[1.02] hover:bg-surface-container-highest/50'
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="font-headline">{item.label}</span>
                {item.href === '/help' && null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDarkMode(v => !v)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-highest/50 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="font-headline text-sm">{isDarkMode ? 'Mode clair' : 'Mode sombre'}</span>
          </button>

          <Link
            href="/new-analysis"
            className="block w-full text-center py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-95"
          >
            Démarrer Analyse
          </Link>
        </div>
      </aside>

      {/* ── TopNavBar ─────────────────────────────────────────── */}
      <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 flex items-center justify-between px-4 lg:px-8 bg-surface-container-low/80 backdrop-blur-3xl z-40 shadow-[0_20px_40px_rgba(45,51,53,0.06)] border-b border-outline-variant/10">

        {/* Burger (mobile only) */}
        <button
          className="lg:hidden p-2 mr-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all"
          onClick={() => setIsSidebarOpen(v => !v)}
        >
          <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
        </button>

        {/* Search */}
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
            <input
              className="w-full bg-surface-container-highest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body"
              placeholder="Rechercher un élève..."
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            />
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 max-h-80 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  searchResults.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                        {student.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline font-bold text-on-surface text-sm truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-on-surface-variant font-body">{student.grade} · {student.age} ans</p>
                      </div>
                      <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${riskBadge(student.riskLevel)}`}>
                        {student.riskLevel}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-on-surface-variant font-body text-sm">
                    <span className="material-symbols-outlined text-2xl mb-2 block opacity-50">search_off</span>
                    Aucun élève trouvé pour &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-4">

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-all flex items-center justify-center relative"
            >
              <span className="material-symbols-outlined" style={notifCount > 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}>notifications</span>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-surface-container-low">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 z-50 overflow-hidden">
                <div className="p-4 border-b border-outline-variant/10">
                  <h3 className="font-headline font-bold text-on-surface text-sm">Alertes & Notifications</h3>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifCount === 0 ? (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-secondary mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <p className="text-on-surface-variant font-body text-sm">Tout est en ordre !</p>
                    </div>
                  ) : (
                    <>
                      {highRisk.length > 0 && (
                        <div>
                          <p className="px-4 py-2 text-xs font-bold text-error bg-error-container/10 uppercase tracking-widest">
                            Risque élevé — {highRisk.length} élève{highRisk.length > 1 ? 's' : ''}
                          </p>
                          {highRisk.map(s => (
                            <Link
                              key={s.id}
                              href={`/students/${s.id}`}
                              onClick={() => setShowNotifications(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center font-bold text-xs">{s.initials}</div>
                              <div>
                                <p className="font-headline font-bold text-on-surface text-sm">{s.firstName} {s.lastName}</p>
                                <p className="text-xs text-on-surface-variant">{s.grade} · Dernière analyse : {s.lastAnalysisDate ?? 'N/A'}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {unanalyzed.length > 0 && (
                        <div>
                          <p className="px-4 py-2 text-xs font-bold text-on-surface-variant bg-surface-container uppercase tracking-widest">
                            Non analysés — {unanalyzed.length} élève{unanalyzed.length > 1 ? 's' : ''}
                          </p>
                          {unanalyzed.map(s => (
                            <Link
                              key={s.id}
                              href="/new-analysis"
                              onClick={() => setShowNotifications(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold text-xs">{s.initials}</div>
                              <div>
                                <p className="font-headline font-bold text-on-surface text-sm">{s.firstName} {s.lastName}</p>
                                <p className="text-xs text-on-surface-variant">{s.grade} · Aucune analyse</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-outline-variant/20 hidden sm:block"></div>
          <UserProfileHeader />
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="lg:ml-64 pt-20 pb-12 px-4 lg:px-12 min-h-screen">
        {children}
      </main>

      {/* ── Onboarding ────────────────────────────────────────── */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </>
  );
}
