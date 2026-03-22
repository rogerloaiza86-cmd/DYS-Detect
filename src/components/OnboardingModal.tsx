"use client";

import { useState } from 'react';
import { completeOnboarding } from '@/lib/store';
import { UserProfile } from '@/lib/types';

const ROLES = [
  'Orthophoniste',
  'Enseignant(e)',
  'Psychologue scolaire',
  'Médecin scolaire',
  'Éducateur(trice) spécialisé(e)',
  'Autre',
];

const FEATURES = [
  { icon: 'mic', label: 'Analyse vocale', desc: 'Enregistrement oral et transcription automatique' },
  { icon: 'draw', label: 'Écriture manuscrite', desc: 'Repérage d\'indicateurs de dysgraphie par photo' },
  { icon: 'psychology', label: 'IA spécialisée', desc: 'Analyse multimodale par Claude & Gemini' },
  { icon: 'picture_as_pdf', label: 'Rapport PDF', desc: 'Export professionnel pour partage' },
];

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<UserProfile>({ firstName: '', lastName: '', role: '' });
  const [customRole, setCustomRole] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; role?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim()) e.lastName = 'Nom requis';
    if (!form.role) e.role = 'Profession requise';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const finalRole = form.role === 'Autre' ? (customRole.trim() || 'Autre') : form.role;
    const profile: UserProfile = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      role: finalRole,
    };
    completeOnboarding(profile);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-surface/95 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 animate-[fadeInUp_0.4s_ease-out]">

        {step === 1 ? (
          /* --- Step 1: Welcome & Features --- */
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/10">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Branding */}
              <div className="bg-gradient-to-br from-primary to-primary-container p-12 flex flex-col justify-between text-on-primary relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-8">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-xs font-headline font-bold tracking-widest uppercase">Outil d'aide au repérage précoce</span>
                  </div>
                  <h1 className="font-headline font-black text-4xl leading-tight mb-4">
                    Bienvenue sur<br />DYS-Detect
                  </h1>
                  <p className="font-body text-on-primary/80 text-lg leading-relaxed">
                    La plateforme d'aide au repérage et à l'orientation des troubles d'apprentissage (DYS, TDAH, TSA) vers les professionnels compétents.
                  </p>
                </div>

                <div className="relative z-10 space-y-4 mt-10">
                  {FEATURES.map(f => (
                    <div key={f.icon} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm">{f.label}</p>
                        <p className="font-body text-on-primary/70 text-xs">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Start prompt */}
              <div className="p-12 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 rounded-full bg-secondary-container/30 flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>waving_hand</span>
                </div>
                <h2 className="font-headline font-bold text-3xl text-on-surface mb-4">
                  Prêt à commencer ?
                </h2>
                <p className="font-body text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xs">
                  Créez votre profil professionnel en 30 secondes pour accéder au tableau de bord.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
                  Créer mon compte
                </button>
                <p className="text-xs text-on-surface-variant font-body mt-6 leading-relaxed max-w-xs">
                  Les données restent sur votre appareil. Aucun compte en ligne requis.
                </p>
              </div>
            </div>
          </div>

        ) : (
          /* --- Step 2: Profile Form --- */
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Form */}
              <div className="p-12 flex flex-col justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-8 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Retour
                </button>

                <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">Votre profil</h2>
                <p className="font-body text-on-surface-variant mb-8">Ces informations apparaîtront sur vos rapports.</p>

                <div className="space-y-5">
                  {/* First name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-on-surface-variant font-headline">Prénom *</label>
                    <input
                      type="text"
                      placeholder="Ex: Sophie"
                      value={form.firstName}
                      onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setErrors({ ...errors, firstName: undefined }); }}
                      className={`w-full p-4 rounded-xl border bg-surface font-body focus:outline-none focus:ring-2 transition-all ${errors.firstName ? 'border-error focus:ring-error/20' : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20'}`}
                    />
                    {errors.firstName && <p className="text-xs text-error font-body">{errors.firstName}</p>}
                  </div>

                  {/* Last name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-on-surface-variant font-headline">Nom *</label>
                    <input
                      type="text"
                      placeholder="Ex: Martin"
                      value={form.lastName}
                      onChange={(e) => { setForm({ ...form, lastName: e.target.value }); setErrors({ ...errors, lastName: undefined }); }}
                      className={`w-full p-4 rounded-xl border bg-surface font-body focus:outline-none focus:ring-2 transition-all ${errors.lastName ? 'border-error focus:ring-error/20' : 'border-outline-variant/30 focus:border-primary focus:ring-primary/20'}`}
                    />
                    {errors.lastName && <p className="text-xs text-error font-body">{errors.lastName}</p>}
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-on-surface-variant font-headline">Profession *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => { setForm({ ...form, role }); setErrors({ ...errors, role: undefined }); }}
                          className={`px-3 py-3 rounded-xl text-sm font-headline font-bold border transition-all text-left ${
                            form.role === role
                              ? 'bg-primary text-on-primary border-primary shadow-md'
                              : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-on-surface'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {errors.role && <p className="text-xs text-error font-body">{errors.role}</p>}
                    {form.role === 'Autre' && (
                      <input
                        type="text"
                        placeholder="Précisez votre rôle..."
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full mt-2 p-3 rounded-xl border border-outline-variant/30 bg-surface font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!form.firstName || !form.lastName || !form.role}
                  className="mt-8 w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                  Accéder au tableau de bord
                </button>
              </div>

              {/* Right: Preview Card */}
              <div className="bg-gradient-to-br from-surface-container-low to-surface-container p-12 flex flex-col justify-center items-center border-l border-outline-variant/10">
                <p className="text-xs font-headline font-bold text-on-surface-variant tracking-widest uppercase mb-8">Aperçu de votre profil</p>

                <div className="w-full max-w-xs bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl shadow-sm border border-primary/10">
                      {form.firstName ? (form.firstName[0] + (form.lastName[0] || '')).toUpperCase() : '??'}
                    </div>
                    <div>
                      <p className="font-headline font-bold text-on-surface text-lg">
                        {form.firstName || 'Prénom'} {form.lastName || 'Nom'}
                      </p>
                      <p className="text-sm text-on-surface-variant font-body">
                        {form.role === 'Autre' ? (customRole || 'Profession') : (form.role || 'Profession')}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-surface-variant font-body">Accès complet au dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-surface-variant font-body">Analyses multimodales illimitées</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-on-surface-variant font-body">Export PDF personnalisé</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant/60 font-body mt-8 text-center max-w-xs leading-relaxed">
                  Vous pourrez modifier ces informations à tout moment depuis l'icône de profil en haut à droite.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
