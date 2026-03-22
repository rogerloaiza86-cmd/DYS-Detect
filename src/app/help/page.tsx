"use client";

import Link from 'next/link';
import { useState } from 'react';

const SECTIONS = [
  {
    id: 'start',
    icon: 'rocket_launch',
    title: 'Démarrage rapide',
    color: 'text-primary',
    bg: 'bg-primary/5 border-primary/10',
    items: [
      { q: 'Comment créer mon compte ?', a: "Au premier lancement, un assistant de bienvenue vous guide pour créer votre profil (prénom, nom, profession). Ce profil apparaîtra sur tous vos rapports PDF." },
      { q: 'Comment modifier mon profil ?', a: "Cliquez sur votre avatar en haut à droite dans la barre de navigation. Une fenêtre vous permettra de modifier votre prénom, nom et profession." },
      { q: 'Mes données sont-elles sauvegardées ?', a: "Oui. Tous les élèves et résultats d'analyses sont stockés dans une base de données PostgreSQL (Supabase) et accessibles depuis n'importe quel appareil." },
    ],
  },
  {
    id: 'students',
    icon: 'groups',
    title: 'Gestion des élèves',
    color: 'text-secondary',
    bg: 'bg-secondary/5 border-secondary/10',
    items: [
      { q: 'Comment ajouter un élève ?', a: "Allez dans \"Élèves\" (menu gauche) > cliquez \"Ajouter un élève\" > remplissez le formulaire (prénom, nom, classe, âge entre 3 et 18 ans)." },
      { q: "Comment voir l'historique d'un élève ?", a: "Dans la liste des élèves, cliquez sur le nom de l'élève ou sur l'icône historique (horloge) en bout de ligne. Vous verrez toutes ses analyses avec l'évolution des scores." },
      { q: 'Comment supprimer un élève ?', a: "Dans la liste, survolez la ligne de l'élève > cliquez sur l'icône corbeille. Une confirmation vous sera demandée. La suppression d'un élève supprime aussi toutes ses analyses." },
      { q: 'Comment filtrer la liste ?', a: "La barre de filtres permet de filtrer par niveau de risque, par classe, de trier par nom/âge/risque/date, et de rechercher par nom." },
    ],
  },
  {
    id: 'analysis',
    icon: 'mic',
    title: 'Réaliser une analyse',
    color: 'text-tertiary',
    bg: 'bg-tertiary/5 border-tertiary/10',
    items: [
      { q: "Quel texte doit lire l'élève ?", a: 'Le texte de référence est affiché à l\'écran : "Le petit chat boit son lait dans la cuisine." L\'élève doit le lire à voix haute, naturellement, sans se presser.' },
      { q: "Comment enregistrer la voix ?", a: "Cliquez sur le gros bouton micro bleu. L'enregistrement démarre. Cliquez à nouveau pour l'arrêter. Une confirmation \"Prise vocale enregistrée\" apparaît." },
      { q: "L'upload d'écriture est-il obligatoire ?", a: "Non, il est optionnel. S'il est fourni, l'IA analysera également les marqueurs de dysgraphie (taille des lettres, respect des lignes, lisibilité). Prenez une photo bien éclairée." },
      { q: "Que se passe-t-il après l'envoi ?", a: "L'IA procède en 2 étapes : (1) transcription de l'audio en texte via Gemini, (2) analyse multimodale via Claude Sonnet 4.6. Le résultat s'affiche en quelques secondes." },
      { q: "L'analyse a échoué, que faire ?", a: "Un bandeau rouge avec un bouton \"Réessayer\" apparaît. Vérifiez votre connexion internet et relancez. Si le problème persiste, vérifiez que les clés API dans .env.local sont valides." },
    ],
  },
  {
    id: 'results',
    icon: 'psychology',
    title: 'Interpréter les résultats',
    color: 'text-primary',
    bg: 'bg-primary/5 border-primary/10',
    items: [
      { q: 'Comment lire le graphique radar ?', a: "Chaque axe correspond à un trouble potentiel. Plus le score est élevé (vers l'extérieur), plus le risque est marqué. En dessous de 40% : faible. De 40 à 70% : modéré. Au-dessus de 70% : élevé." },
      { q: 'Que signifient les couleurs des barres ?', a: "Vert (< 40%) : pas de signal significatif. Orange (40-70%) : surveiller. Rouge (> 70%) : attention requise, consulter un spécialiste." },
      { q: 'Les recommandations sont-elles définitives ?', a: "Non. Elles sont générées par l'IA comme premières pistes pédagogiques et d'orientation. Elles ne remplacent pas une évaluation professionnelle (orthophoniste, neuropsychologue, médecin)." },
      { q: 'Comment exporter le rapport ?', a: "Cliquez sur \"Exporter le rapport en PDF\" en bas de la page de résultats. Un fichier A4 est généré avec le graphique radar, les scores et les recommandations." },
      { q: 'Comment supprimer une analyse ?', a: "En bas à gauche de la page de résultats, cliquez \"Supprimer cette analyse\". Une confirmation est demandée. Vous serez redirigé vers l'historique de l'élève." },
    ],
  },
  {
    id: 'nav',
    icon: 'navigation',
    title: 'Navigation & Interface',
    color: 'text-secondary',
    bg: 'bg-secondary/5 border-secondary/10',
    items: [
      { q: 'Comment basculer en mode sombre ?', a: "Cliquez sur \"Mode sombre\" en bas du menu de navigation gauche. Votre préférence est sauvegardée automatiquement." },
      { q: 'À quoi servent les notifications ?', a: "La cloche en haut à droite affiche le nombre d'élèves nécessitant attention : ceux en \"Risque Élevé\" et ceux jamais analysés. Cliquez pour voir la liste." },
      { q: 'La recherche dans le header fonctionne-t-elle ?', a: "Oui. Tapez 2 caractères minimum pour filtrer les élèves par nom, prénom ou classe. Cliquez sur un résultat pour accéder à sa dernière analyse ou lancer une nouvelle." },
      { q: "L'application fonctionne-t-elle sur mobile ?", a: "Oui. Sur les petits écrans, la sidebar se replie. Un bouton hamburger apparaît en haut à gauche pour l'ouvrir." },
    ],
  },
];

export default function HelpPage() {
  const [openSection, setOpenSection] = useState<string | null>('start');
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-6 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Tableau de bord
        </Link>
        <h1 className="font-headline font-black text-4xl text-on-surface tracking-tight mb-3">Centre d&apos;aide</h1>
        <p className="text-on-surface-variant font-body text-lg">Tout ce que vous devez savoir pour utiliser DYS-Detect.</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: 'school', label: 'Démarrer', href: '/new-analysis', color: 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary' },
          { icon: 'groups', label: 'Mes élèves', href: '/students', color: 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary' },
          { icon: 'dashboard', label: 'Dashboard', href: '/', color: 'bg-tertiary/10 text-tertiary hover:bg-tertiary hover:text-on-tertiary' },
          { icon: 'mail', label: 'Contact', href: 'mailto:contact@dys-detect.fr', color: 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high' },
        ].map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl font-headline font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 border border-outline-variant/10 ${item.color}`}
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.id} className={`rounded-2xl border overflow-hidden ${section.bg}`}>
            <button
              onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-black/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className={`material-symbols-outlined text-2xl ${section.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {section.icon}
                </span>
                <span className={`font-headline font-bold text-xl ${section.color}`}>{section.title}</span>
                <span className="text-xs text-on-surface-variant font-body bg-surface-container-highest px-2 py-0.5 rounded-full">
                  {section.items.length} questions
                </span>
              </div>
              <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${openSection === section.id ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {openSection === section.id && (
              <div className="border-t border-outline-variant/10">
                {section.items.map((item, idx) => {
                  const key = `${section.id}-${idx}`;
                  return (
                    <div key={key} className="border-b border-outline-variant/10 last:border-b-0">
                      <button
                        onClick={() => setOpenItem(openItem === key ? null : key)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-black/5 transition-colors"
                      >
                        <span className="font-headline font-bold text-on-surface text-sm pr-4">{item.q}</span>
                        <span className={`material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 ${openItem === key ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                      {openItem === key && (
                        <div className="px-6 pb-5">
                          <p className="text-on-surface-variant font-body leading-relaxed text-sm bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 text-center">
        <span className="material-symbols-outlined text-4xl text-primary mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
        <h3 className="font-headline font-bold text-on-surface text-xl mb-2">Prêt à analyser ?</h3>
        <p className="text-on-surface-variant font-body text-sm mb-6">
          DYS-Detect est un outil d'aide au repérage précoce. Les indicateurs générés orientent vers les professionnels compétents — ils ne constituent pas une évaluation clinique.
        </p>
        <Link href="/new-analysis" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-headline font-bold hover:bg-primary-dim transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
          Démarrer une analyse
        </Link>
      </div>
    </div>
  );
}
