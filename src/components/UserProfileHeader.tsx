"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getProfile, saveProfile } from '@/lib/store';
import { UserProfile } from '@/lib/types';

export default function UserProfileHeader() {
  const [profile, setProfile] = useState<UserProfile>({ firstName: '', lastName: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>({ firstName: '', lastName: '', role: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProfile(getProfile());
    setMounted(true);
  }, []);

  const handleOpenEdit = () => {
    setForm(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName) return;
    saveProfile(form);
    setProfile(form);
    setIsEditing(false);
  };

  const initials = (profile.firstName.charAt(0) + profile.lastName.charAt(0)).toUpperCase() || 'SM';

  return (
    <>
      <div 
        onClick={handleOpenEdit}
        className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors group"
      >
        <div className="text-right hidden sm:block">
          <p className="font-headline text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
            {profile.firstName || 'Votre'} {profile.lastName || 'Nom'}
          </p>
          <p className="text-xs text-on-surface-variant font-body">
            {profile.role || 'Profession'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary group-hover:bg-primary/20 transition-colors">
          {initials}
        </div>
      </div>

      {isEditing && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-variant/80 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-outline-variant/20 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Modifier le profil</h2>
              <button onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface-variant font-body">Prénom</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface-variant font-body">Nom</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-on-surface-variant font-body">Profession / Rôle</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body"
                />
              </div>
              
              <button
                onClick={handleSave}
                disabled={!form.firstName || !form.lastName}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-headline font-bold mt-4 hover:bg-primary-dim transition-colors disabled:opacity-50"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
