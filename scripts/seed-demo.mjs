/**
 * Script de démonstration — insère 8 élèves fictifs avec analyses variées
 * Usage : node scripts/seed-demo.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://xrvehxoqcsgrjwcsdett.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_uhyAgPy4bSZZKfT2tQL1fA_6wttlYdI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Données fictives ──────────────────────────────────────────────────────

const STUDENTS = [
  { id: 'demo-s1', first_name: 'Emma',    last_name: 'Dupont',    initials: 'ED', grade: 'CE2', age: 8,  risk_level: 'Risque Élevé',   last_analysis_date: '15 mars 2026' },
  { id: 'demo-s2', first_name: 'Lucas',   last_name: 'Martin',    initials: 'LM', grade: 'CM1', age: 9,  risk_level: 'Risque Modéré',  last_analysis_date: '14 mars 2026' },
  { id: 'demo-s3', first_name: 'Léa',     last_name: 'Bernard',   initials: 'LB', grade: 'CP',  age: 6,  risk_level: 'Faible Risque',  last_analysis_date: '13 mars 2026' },
  { id: 'demo-s4', first_name: 'Nathan',  last_name: 'Rousseau',  initials: 'NR', grade: 'CM2', age: 11, risk_level: 'Risque Élevé',   last_analysis_date: '12 mars 2026' },
  { id: 'demo-s5', first_name: 'Chloé',   last_name: 'Petit',     initials: 'CP', grade: 'CE1', age: 7,  risk_level: 'Faible Risque',  last_analysis_date: '11 mars 2026' },
  { id: 'demo-s6', first_name: 'Hugo',    last_name: 'Moreau',    initials: 'HM', grade: 'CM1', age: 10, risk_level: 'Risque Modéré',  last_analysis_date: '10 mars 2026' },
  { id: 'demo-s7', first_name: 'Manon',   last_name: 'Lefebvre',  initials: 'ML', grade: 'CE2', age: 8,  risk_level: 'Non identifié',  last_analysis_date: null },
  { id: 'demo-s8', first_name: 'Théo',    last_name: 'Simon',     initials: 'TS', grade: 'CP',  age: 6,  risk_level: 'Risque Élevé',   last_analysis_date: '8 mars 2026' },
];

const RESULTS = [
  // ─── Emma Dupont — Risque Élevé (dyslexie sévère) — 2 analyses ───────────
  {
    id: 'demo-r1a',
    student_id: 'demo-s1',
    date: new Date('2026-02-10').toISOString(),
    global_risk_level: 'Risque Modéré',
    transcription: 'Emma a lulu un tixte sûr les animau. Elle a écri : "le sha manJ la suris". Plusieurs confusions phonémiques observées.',
    markers: [
      { name: 'Confusion phonémique', score: 65, description: 'Substitution de phonèmes proches (ch/s, j/g)' },
      { name: 'Omissions de lettres', score: 55, description: 'Omissions en fin de mot' },
      { name: 'Inversions syllabiques', score: 40, description: 'Quelques inversions légères' },
      { name: 'Segmentation incorrecte', score: 30, description: 'Légères difficultés de segmentation' },
      { name: 'Substitution visuelle', score: 25, description: 'Confusion b/d occasionnelle' },
    ],
    recommendations: [
      'Renforcer la conscience phonologique avec exercices quotidiens',
      'Utiliser des supports multisensoriels pour la lecture',
      'Consulter un orthophoniste pour bilan approfondi',
    ],
  },
  {
    id: 'demo-r1b',
    student_id: 'demo-s1',
    date: new Date('2026-03-15').toISOString(),
    global_risk_level: 'Risque Élevé',
    transcription: 'Emma a redikté la même fraz. On observ : "le sha manJ la suriz et kour dans la forê". Dégradation notable.',
    markers: [
      { name: 'Confusion phonémique', score: 82, description: 'Confusion sévère (f/v, t/d, p/b)' },
      { name: 'Omissions de lettres', score: 75, description: 'Omissions fréquentes en milieu de mot' },
      { name: 'Inversions syllabiques', score: 68, description: 'Inversions syllabiques répétées' },
      { name: 'Segmentation incorrecte', score: 60, description: 'Mots fusionnés ou découpés incorrectement' },
      { name: 'Substitution visuelle', score: 70, description: 'Confusion b/d, p/q systématique' },
    ],
    recommendations: [
      'Prise en charge orthophonique urgente recommandée',
      'Aménagements scolaires (tiers-temps, outils numériques)',
      'Rééducation phonologique intensive 3x/semaine',
      'Informer les parents des difficultés observées',
    ],
  },

  // ─── Lucas Martin — Risque Modéré (dysorthographie) ──────────────────────
  {
    id: 'demo-r2',
    student_id: 'demo-s2',
    date: new Date('2026-03-14').toISOString(),
    global_risk_level: 'Risque Modéré',
    transcription: 'Lucas a écrit une courte histoire. Texte : "Il était une fois un garçon qui aimé jouer au foot. Il a marqué baucoup de but et son équip a gané". Erreurs grammaticales et orthographiques notables.',
    markers: [
      { name: 'Erreurs grammaticales', score: 60, description: 'Accord sujet-verbe souvent incorrect' },
      { name: 'Confusion phonémique', score: 45, description: 'Phonèmes complexes mal restitués' },
      { name: 'Omissions de lettres', score: 40, description: 'Omissions en fin de mot (pluriel)' },
      { name: 'Inversions syllabiques', score: 20, description: 'Rares inversions' },
      { name: 'Segmentation incorrecte', score: 35, description: 'Quelques agglutinations de mots' },
    ],
    recommendations: [
      'Exercices de conjugaison et d\'accord adaptés',
      'Dictées préparées régulières',
      'Logiciel de correction orthographique pour les devoirs',
    ],
  },

  // ─── Léa Bernard — Faible Risque ──────────────────────────────────────────
  {
    id: 'demo-r3',
    student_id: 'demo-s3',
    date: new Date('2026-03-13').toISOString(),
    global_risk_level: 'Faible Risque',
    transcription: 'Léa a correctement lu et retranscrit le passage. Texte produit : "Le chat mange la souris et court dans le jardin". Bonne fluidité, légères hésitations sur les mots complexes.',
    markers: [
      { name: 'Confusion phonémique', score: 15, description: 'Très peu de confusions phonémiques' },
      { name: 'Omissions de lettres', score: 10, description: 'Quasi aucune omission' },
      { name: 'Inversions syllabiques', score: 8,  description: 'Aucune inversion notable' },
      { name: 'Segmentation incorrecte', score: 12, description: 'Segmentation correcte' },
      { name: 'Substitution visuelle', score: 10, description: 'Pas de confusion visuelle' },
    ],
    recommendations: [
      'Continuer la lecture plaisir quotidienne',
      'Proposer des textes plus complexes pour stimuler la progression',
      'Pas d\'inquiétude particulière à ce stade',
    ],
  },

  // ─── Nathan Rousseau — Risque Élevé (dyspraxie + dyslexie) — 3 analyses ──
  {
    id: 'demo-r4a',
    student_id: 'demo-s4',
    date: new Date('2026-01-20').toISOString(),
    global_risk_level: 'Risque Modéré',
    transcription: 'Nathan présente des difficultés graphomotrices. Écriture irrégulière, lettres de tailles variables. Texte : "je veu alé a lécole avé mon ami piere". Effort visible.',
    markers: [
      { name: 'Erreurs graphomotrices', score: 55, description: 'Maladresse dans le tracé des lettres' },
      { name: 'Confusion phonémique', score: 50, description: 'Substitutions fréquentes' },
      { name: 'Omissions de lettres', score: 60, description: 'Nombreuses omissions' },
      { name: 'Segmentation incorrecte', score: 45, description: 'Mots souvent collés' },
      { name: 'Substitution visuelle', score: 40, description: 'Confusions visuelles b/d, p/q' },
    ],
    recommendations: [
      'Évaluation ergothérapeutique pour la motricité fine',
      'Autoriser le traitement de texte pour les devoirs longs',
      'Exercices de graphomotricité quotidiens',
    ],
  },
  {
    id: 'demo-r4b',
    student_id: 'demo-s4',
    date: new Date('2026-02-15').toISOString(),
    global_risk_level: 'Risque Élevé',
    transcription: 'Séance de réévaluation. Texte dicté plus long. Nathan : "jé pa pu fini tou lé mo parce ke ma main fatigé trés vit et jé plu pensé a ce ke faler écrir". Dégradation rapide sur texte long.',
    markers: [
      { name: 'Erreurs graphomotrices', score: 78, description: 'Fatigue graphique importante, prise de stylo douloureuse signalée' },
      { name: 'Confusion phonémique', score: 72, description: 'Augmentation des substitutions' },
      { name: 'Omissions de lettres', score: 80, description: 'Omissions massives sous charge cognitive' },
      { name: 'Segmentation incorrecte', score: 65, description: 'Agglutinations fréquentes' },
      { name: 'Substitution visuelle', score: 60, description: 'Confusions visuelles aggravées' },
    ],
    recommendations: [
      'Prise en charge orthophonique + ergothérapeutique conjointe',
      'Plan d\'accompagnement personnalisé (PAP) à demander',
      'Réduction de la quantité d\'écriture manuscrite',
      'Évaluation neuropsychologique recommandée',
    ],
  },
  {
    id: 'demo-r4c',
    student_id: 'demo-s4',
    date: new Date('2026-03-12').toISOString(),
    global_risk_level: 'Risque Élevé',
    transcription: 'Après 3 semaines avec clavier. Texte tapé : "Je voulais aller à l\'école avec mon ami Pierre". Amélioration nette à l\'écrit clavier, difficultés phonémiques persistent à l\'oral.',
    markers: [
      { name: 'Erreurs graphomotrices', score: 20, description: 'Résolu par le clavier' },
      { name: 'Confusion phonémique', score: 75, description: 'Persistent à l\'oral, indépendantes de la motricité' },
      { name: 'Omissions de lettres', score: 55, description: 'Moins fréquentes avec le clavier' },
      { name: 'Segmentation incorrecte', score: 40, description: 'Amélioration notable' },
      { name: 'Substitution visuelle', score: 65, description: 'Confusions persistantes' },
    ],
    recommendations: [
      'Maintenir le clavier pour toutes les productions écrites',
      'Focaliser la rééducation sur la phonologie uniquement',
      'Bilan MDPH à envisager pour matériel adapté',
    ],
  },

  // ─── Chloé Petit — Faible Risque ──────────────────────────────────────────
  {
    id: 'demo-r5',
    student_id: 'demo-s5',
    date: new Date('2026-03-11').toISOString(),
    global_risk_level: 'Faible Risque',
    transcription: 'Chloé lit avec expressivité et produit un texte cohérent. "Ma famille est allée à la mer cet été. J\'ai vu des dauphins et j\'ai mangé des glaces." Orthographe quasi parfaite.',
    markers: [
      { name: 'Confusion phonémique', score: 8,  description: 'Aucune confusion notable' },
      { name: 'Omissions de lettres', score: 5,  description: 'Très rares' },
      { name: 'Inversions syllabiques', score: 3, description: 'Absentes' },
      { name: 'Segmentation incorrecte', score: 7, description: 'Excellente segmentation' },
      { name: 'Substitution visuelle', score: 5, description: 'Aucune' },
    ],
    recommendations: [
      'Aucune intervention spécifique requise',
      'Encourager la lecture autonome de livres adaptés au niveau CE1',
      'Suivi annuel de routine suffisant',
    ],
  },

  // ─── Hugo Moreau — Risque Modéré (dyscalculie suspectée + lecture) ────────
  {
    id: 'demo-r6',
    student_id: 'demo-s6',
    date: new Date('2026-03-10').toISOString(),
    global_risk_level: 'Risque Modéré',
    transcription: 'Hugo confond souvent les chiffres et les lettres visuellement semblables. Texte : "il avai 6 chaz dan la maison mais seulemant 3 manja". Difficultés de mémorisation des mots fréquents.',
    markers: [
      { name: 'Substitution visuelle', score: 58, description: 'Confusion 6/b, 3/e, 9/q fréquente' },
      { name: 'Confusion phonémique', score: 42, description: 'Modérée, phonèmes complexes' },
      { name: 'Omissions de lettres', score: 50, description: 'Fin de mots souvent tronquée' },
      { name: 'Inversions syllabiques', score: 35, description: 'Inversions sur mots longs' },
      { name: 'Segmentation incorrecte', score: 30, description: 'Quelques erreurs de segmentation' },
    ],
    recommendations: [
      'Bilan orthophonique ciblé sur les confusions visuo-spatiales',
      'Exercices de discrimination visuelle',
      'Vérifier la vision (consultation ophtalmologique si non faite)',
      'Fiches de référence pour les lettres/chiffres problématiques',
    ],
  },

  // ─── Théo Simon — Risque Élevé (dysphasie suspectée) ─────────────────────
  {
    id: 'demo-r8',
    student_id: 'demo-s8',
    date: new Date('2026-03-08').toISOString(),
    global_risk_level: 'Risque Élevé',
    transcription: 'Théo présente des difficultés langagières importantes à l\'oral. Lors de l\'exercice de répétition de phrases : "le... le cha... mang... souri". À l\'écrit, production quasi absente. Seulement 3 mots produits en 10 minutes.',
    markers: [
      { name: 'Confusion phonémique', score: 88, description: 'Erreurs phonémiques massives, structure syllabique dégradée' },
      { name: 'Omissions de lettres', score: 90, description: 'Omissions sévères, mots réduits à 1-2 phonèmes' },
      { name: 'Inversions syllabiques', score: 75, description: 'Métathèses fréquentes' },
      { name: 'Segmentation incorrecte', score: 70, description: 'Absence de frontières entre les mots' },
      { name: 'Substitution visuelle', score: 55, description: 'Difficultés visuospatiales associées' },
    ],
    recommendations: [
      'Consultation neurologique et bilan de langage complet en urgence',
      'Suivi orthophonique intensif (5 séances/semaine recommandées)',
      'Mise en place d\'une communication alternative et améliorée (CAA)',
      'Réunion d\'équipe pluridisciplinaire avec les parents',
      'Demande MDPH pour accompagnement AESH',
    ],
  },
];

// ─── Insertion ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Insertion des élèves de démonstration...\n');

  // Nettoyer les données demo existantes
  const ids = STUDENTS.map(s => s.id);
  const { error: delResErr } = await supabase.from('analysis_results').delete().in('student_id', ids);
  if (delResErr) console.warn('  Nettoyage résultats:', delResErr.message);

  const { error: delStuErr } = await supabase.from('students').delete().in('id', ids);
  if (delStuErr) console.warn('  Nettoyage élèves:', delStuErr.message);

  // Insérer les élèves
  const { error: stuErr } = await supabase.from('students').insert(STUDENTS);
  if (stuErr) {
    console.error('❌ Erreur insertion élèves:', stuErr.message);
    process.exit(1);
  }
  console.log(`✅ ${STUDENTS.length} élèves insérés`);

  // Insérer les résultats
  const { error: resErr } = await supabase.from('analysis_results').insert(RESULTS);
  if (resErr) {
    console.error('❌ Erreur insertion résultats:', resErr.message);
    process.exit(1);
  }
  console.log(`✅ ${RESULTS.length} analyses insérées\n`);

  console.log('📊 Résumé :');
  for (const s of STUDENTS) {
    const count = RESULTS.filter(r => r.student_id === s.id).length;
    const emoji = s.risk_level === 'Risque Élevé' ? '🔴' : s.risk_level === 'Risque Modéré' ? '🟠' : s.risk_level === 'Faible Risque' ? '🟢' : '⚪';
    console.log(`  ${emoji} ${s.first_name} ${s.last_name} (${s.grade}, ${s.age} ans) — ${count} analyse(s)`);
  }
  console.log('\n🎉 Base de données prête pour la démo !');
}

seed().catch(console.error);
