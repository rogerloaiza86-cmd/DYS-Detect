// ─── Banque de textes de référence DYS-Detect ────────────────────────────

export type TextDifficulty = 'facile' | 'moyen' | 'difficile';
export type TextTarget = 'DYS' | 'TDAH' | 'TSA' | 'general';
export type GradeLevel = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6eme' | '5eme' | '4eme';

export interface ReferenceText {
  id: string;
  title: string;
  text: string;
  gradeLevel: GradeLevel[];
  difficulty: TextDifficulty;
  targets: TextTarget[];
  wordCount: number;
  phonologicalFeatures: string[];
  notes: string;
}

export const TEXTS_BANK: ReferenceText[] = [
  // ── CP / CE1 ─────────────────────────────────────────────────────────────
  {
    id: 'cp-01',
    title: 'Le petit chat',
    text: 'Le chat boit son lait. Il est dans la cuisine. Maman appelle le chat. Il vient vite.',
    gradeLevel: ['CP'],
    difficulty: 'facile',
    targets: ['DYS', 'general'],
    wordCount: 17,
    phonologicalFeatures: ['sons_simples', 'mots_monosyllabiques', 'voyelles_courtes'],
    notes: 'Texte très court pour CP début d\'année. Sons courants uniquement.',
  },
  {
    id: 'cp-02',
    title: 'La pluie et le soleil',
    text: 'Il pleut dehors. Les nuages sont gris. Le soleil se cache. Tom reste à la maison. Il joue avec son chien.',
    gradeLevel: ['CP'],
    difficulty: 'facile',
    targets: ['general'],
    wordCount: 21,
    phonologicalFeatures: ['sons_simples', 'groupes_consonantiques_pl', 'voyelles_courtes'],
    notes: 'Structure narrative courte. Bon repère pour la fluidité en CP.',
  },
  {
    id: 'ce1-01',
    title: 'Mon meilleur ami',
    text: 'Mon meilleur ami s\'appelle Théo. Il a les yeux bleus et les cheveux bouclés. Il est toujours joyeux et il me fait rire. Quand je suis triste, il vient me consoler. Je suis content d\'avoir un ami comme lui.',
    gradeLevel: ['CE1', 'CE2'],
    difficulty: 'facile',
    targets: ['TSA', 'general'],
    wordCount: 39,
    phonologicalFeatures: ['sons_simples', 'voyelles_complexes_eu', 'liaisons'],
    notes: 'Contenu émotionnel et social explicite. Repère les difficultés de compréhension contextuelle (TSA).',
  },
  {
    id: 'ce1-02',
    title: 'La promenade en forêt',
    text: 'Ce matin, nous sommes allés nous promener dans la forêt. Les oiseaux chantaient dans les arbres. Nous avons ramassé des feuilles de toutes les couleurs. Puis nous avons mangé un goûter sur un rocher.',
    gradeLevel: ['CE1', 'CE2'],
    difficulty: 'facile',
    targets: ['general'],
    wordCount: 37,
    phonologicalFeatures: ['sons_simples', 'voyelles_complexes_ou_oi', 'pluriels'],
    notes: 'Récit chronologique simple. Bon pour tester la cohérence narrative.',
  },
  {
    id: 'ce1-03',
    title: 'La tempête de neige',
    text: 'Hier soir, une grande tempête de neige a recouvert le village. Les branches des arbres pliaient sous le poids de la neige. Les enfants ont mis leurs bottes et leurs gants pour sortir jouer. Ils ont construit un grand bonhomme de neige devant la maison.',
    gradeLevel: ['CE1', 'CE2'],
    difficulty: 'moyen',
    targets: ['DYS', 'general'],
    wordCount: 47,
    phonologicalFeatures: ['groupes_consonantiques_br_gr_pl', 'sons_complexes_an_on', 'consonnes_doubles'],
    notes: 'Nombreux groupes consonantiques (br, gr, pl, bl). Idéal pour repérer les inversions et substitutions phonémiques DYS.',
  },

  // ── CE2 / CM1 ─────────────────────────────────────────────────────────────
  {
    id: 'ce2-01',
    title: 'Le marché du village',
    text: 'Tous les samedis, grand-mère va au marché du village. Elle achète des fruits, des légumes et du fromage. Le marchand lui donne toujours un petit extra parce qu\'elle est sa meilleure cliente. En rentrant, elle prépare une bonne soupe pour toute la famille.',
    gradeLevel: ['CE2', 'CM1'],
    difficulty: 'moyen',
    targets: ['general'],
    wordCount: 44,
    phonologicalFeatures: ['sons_complexes_ai_au', 'voyelles_nasales', 'groupes_consonantiques_pr_fr'],
    notes: 'Structure narrative complète avec début, milieu, fin. Bon pour évaluer la cohérence TDAH.',
  },
  {
    id: 'ce2-02',
    title: 'Les confusions de Tom',
    text: 'Tom a pris son vélo pour aller à l\'école. Il a freiné devant la porte bleue. Dans son cartable, il avait mis ses crayons, sa trousse et ses livres. Mais il avait oublié son goûter sur la table de la cuisine.',
    gradeLevel: ['CE2'],
    difficulty: 'moyen',
    targets: ['DYS'],
    wordCount: 41,
    phonologicalFeatures: ['consonnes_sourdes_sonores_p_b_t_d', 'groupes_consonantiques_bl_fr_tr', 'voyelles_complexes_eau_ou'],
    notes: 'Ciblé DYS : nombreuses paires sourdes/sonores (p/b, t/d) et groupes consonantiques. Repère les substitutions phonémiques.',
  },
  {
    id: 'ce2-03',
    title: 'La famille des hérissons',
    text: 'Dans le jardin de mamie, vivent trois hérissons. Le plus petit s\'appelle Pic. La nuit, ils cherchent des vers de terre et des limaces. En hiver, ils s\'endorment dans un tas de feuilles mortes et ne se réveillent qu\'au printemps.',
    gradeLevel: ['CE2', 'CM1'],
    difficulty: 'moyen',
    targets: ['general', 'TSA'],
    wordCount: 46,
    phonologicalFeatures: ['sons_complexes_oi_ou_in', 'groupes_consonantiques_pr_tr', 'voyelles_nasales'],
    notes: 'Description factuelle d\'un comportement animal. Bon pour TSA (vocabulaire précis, faits concrets).',
  },
  {
    id: 'cm1-01',
    title: "L'aventure du randonneur",
    text: "Pierre marchait depuis plusieurs heures sur le sentier de montagne. Le soleil commençait à descendre derrière les sommets enneigés. Il devait trouver un abri avant la nuit, car la température allait baisser rapidement. Heureusement, il aperçut une petite cabane de berger à travers les sapins.",
    gradeLevel: ['CM1', 'CM2'],
    difficulty: 'moyen',
    targets: ['TDAH', 'general'],
    wordCount: 46,
    phonologicalFeatures: ['groupes_consonantiques_tr_pr_br', 'sons_complexes_ent_ment', 'voyelles_longues'],
    notes: 'Récit avec structure temporelle forte et suspense. Repère les difficultés de cohérence et de maintien de l\'attention (TDAH).',
  },
  {
    id: 'cm1-02',
    title: 'Le renard et la cigogne',
    text: 'Un jour, le renard invita la cigogne à dîner. Il servit un potage dans une assiette plate. La cigogne ne put rien manger avec son long bec. Pour se venger, elle invita le renard et servit le repas dans un vase à long col. Le renard repartit le ventre vide. Qui trompe son ami mérite d\'être trompé.',
    gradeLevel: ['CM1', 'CM2'],
    difficulty: 'moyen',
    targets: ['TDAH', 'TSA', 'general'],
    wordCount: 59,
    phonologicalFeatures: ['sons_complexes_oi_an_en', 'groupes_consonantiques_pr_tr_gr', 'voyelles_nasales'],
    notes: 'Fable avec morale implicite. Évalue la compréhension de la dimension sociale et symbolique (TSA) et la cohérence narrative (TDAH).',
  },
  {
    id: 'cm1-03',
    title: 'Les volcans',
    text: 'Un volcan est une ouverture dans la croûte terrestre par laquelle sortent des matières en fusion appelées lave. Les éruptions peuvent être explosives ou effusives. Les cendres volcaniques, projetées à des kilomètres de hauteur, peuvent perturber le trafic aérien. Les volcans se forment souvent aux frontières des plaques tectoniques.',
    gradeLevel: ['CM1', 'CM2'],
    difficulty: 'moyen',
    targets: ['TSA', 'general'],
    wordCount: 51,
    phonologicalFeatures: ['mots_scientifiques', 'groupes_consonantiques_str_tr_ct', 'sons_complexes_tion'],
    notes: 'Texte documentaire avec vocabulaire précis et technique. Idéal pour TSA (préférence pour les faits et le vocabulaire spécialisé).',
  },

  // ── CM2 / 6ème ──────────────────────────────────────────────────────────
  {
    id: 'cm2-01',
    title: 'La découverte scientifique',
    text: 'Les scientifiques ont découvert une nouvelle espèce de papillon dans la forêt amazonienne. Cet insecte, aux ailes bleu métallique, ne vit que dans les zones où la végétation est particulièrement dense. Cette découverte souligne l\'importance de protéger les forêts tropicales, qui abritent encore de nombreuses espèces inconnues.',
    gradeLevel: ['CM2', '6eme'],
    difficulty: 'difficile',
    targets: ['TSA', 'general'],
    wordCount: 51,
    phonologicalFeatures: ['mots_scientifiques', 'structures_syntaxiques_complexes', 'groupes_consonantiques_str_bl_sp'],
    notes: 'Texte documentaire avec subordonnées complexes. Évalue la compréhension syntaxique et le vocabulaire scientifique.',
  },
  {
    id: 'cm2-02',
    title: 'La lettre de Camille',
    text: 'Chère grand-maman, je t\'écris depuis le camp de vacances. Hier, nous avons fait une randonnée magnifique jusqu\'au sommet d\'une colline. J\'ai rencontré une fille super sympa qui s\'appelle Inès. Elle me fait penser à toi quand tu me racontes tes souvenirs d\'enfance. Tu me manques beaucoup. Bisous, Camille.',
    gradeLevel: ['CM2', '6eme'],
    difficulty: 'moyen',
    targets: ['TSA', 'TDAH', 'general'],
    wordCount: 55,
    phonologicalFeatures: ['sons_complexes_an_en_in', 'voyelles_complexes_eau_ien', 'structures_emotionnelles'],
    notes: 'Texte avec expressions émotionnelles explicites et contenu social (TSA). Structure narrative linéaire (TDAH).',
  },
  {
    id: 'cm2-03',
    title: 'Le labyrinthe des sons',
    text: 'Baptiste attrapa sa baguette et traversa bravement le corridor obscur. Les bruits étranges provenaient du laboratoire du professeur Brun. Devant la porte, il trouva un flacon bleu plein d\'un produit brillant. Il prit le flacon et le porta précautionneusement jusqu\'au laboratoire. La baguette brillait doucement dans le noir.',
    gradeLevel: ['CM2', '6eme'],
    difficulty: 'difficile',
    targets: ['DYS'],
    wordCount: 50,
    phonologicalFeatures: ['consonnes_sourdes_sonores_p_b_t_d_f_v', 'groupes_consonantiques_br_tr_bl_pr_fl', 'voyelles_complexes_eau_ou_oi'],
    notes: 'Texte densément ciblé DYS : toutes les paires sourdes/sonores, tous les principaux groupes consonantiques. Maximum de pièges phonémiques.',
  },
  {
    id: '6eme-01',
    title: "L'île au trésor",
    text: 'Jim Hawkins trouva une vieille carte au fond du coffre du marin. Sur le parchemin jauni, une île mystérieuse était représentée avec, en son centre, une croix rouge marquant l\'emplacement d\'un trésor fabuleux. Sans hésiter, Jim décida d\'organiser une expédition avec ses amis pour percer ce mystère insondable.',
    gradeLevel: ['6eme', '5eme'],
    difficulty: 'difficile',
    targets: ['general', 'TDAH'],
    wordCount: 55,
    phonologicalFeatures: ['mots_complexes_etymologiques', 'structures_syntaxiques_complexes', 'groupes_consonantiques_str_pr_tr'],
    notes: 'Texte littéraire avec vocabulaire riche et structures syntaxiques élaborées. Bon indicateur de compréhension globale.',
  },
  {
    id: '6eme-02',
    title: 'La biodiversité menacée',
    text: 'Chaque année, des centaines d\'espèces animales et végétales disparaissent à cause des activités humaines. La déforestation, la pollution des océans et le changement climatique fragilisent les écosystèmes du monde entier. Pourtant, des associations de protection de la nature se mobilisent partout pour sensibiliser les populations et préserver ces richesses inestimables.',
    gradeLevel: ['6eme', '5eme'],
    difficulty: 'difficile',
    targets: ['TSA', 'general'],
    wordCount: 53,
    phonologicalFeatures: ['mots_scientifiques', 'structures_syntaxiques_complexes', 'sons_complexes_tion_ment'],
    notes: 'Texte argumentatif. Évalue la compréhension du vocabulaire scientifique et des structures de causalité.',
  },

  // ── Textes spécifiquement ciblés TDAH ────────────────────────────────────
  {
    id: 'tdah-01',
    title: 'La journée de Lucas',
    text: 'Le matin, Lucas se lève et mange ses céréales. Ensuite, il prend son sac et va à l\'école. En classe, il écoute la maîtresse qui parle des dinosaures. À midi, il mange avec ses amis à la cantine. L\'après-midi, il joue au foot dans la cour. Le soir, il rentre chez lui, fait ses devoirs et se couche.',
    gradeLevel: ['CE1', 'CE2'],
    difficulty: 'facile',
    targets: ['TDAH'],
    wordCount: 58,
    phonologicalFeatures: ['connecteurs_temporels', 'structure_chronologique', 'phrases_courtes'],
    notes: 'Structure temporelle très explicite (matin, ensuite, midi, après-midi, soir). Évalue la capacité à suivre une séquence narrative (TDAH).',
  },
  {
    id: 'tdah-02',
    title: 'La recette du gâteau au chocolat',
    text: 'Pour faire un gâteau au chocolat, il faut d\'abord rassembler les ingrédients : des œufs, du beurre, de la farine et du sucre. Ensuite, on casse les œufs et on mélange avec le sucre. Puis on fait fondre le chocolat et le beurre ensemble. On ajoute la farine et on mélange bien. Enfin, on verse la pâte dans un moule et on met au four pendant vingt minutes.',
    gradeLevel: ['CE2', 'CM1'],
    difficulty: 'moyen',
    targets: ['TDAH', 'TSA'],
    wordCount: 71,
    phonologicalFeatures: ['connecteurs_logiques_dabord_ensuite_puis', 'structure_procedurales', 'enumeration'],
    notes: 'Texte procédural avec connecteurs séquentiels explicites. Évalue la compréhension et la restitution d\'une procédure ordonnée (TDAH + TSA).',
  },
  {
    id: 'tdah-03',
    title: 'Le match de football',
    text: 'Au début du match, les deux équipes entrèrent sur le terrain sous les applaudissements. Pendant la première mi-temps, le gardien réalisa plusieurs arrêts spectaculaires. À la mi-temps, l\'entraîneur expliqua une nouvelle tactique à ses joueurs. Dans la deuxième mi-temps, un joueur marqua un but magnifique. À la fin du match, l\'équipe victorieuse fêta sa victoire avec ses supporters.',
    gradeLevel: ['CM1', 'CM2'],
    difficulty: 'moyen',
    targets: ['TDAH'],
    wordCount: 62,
    phonologicalFeatures: ['connecteurs_temporels_debut_pendant_fin', 'structure_narrative_5_parties', 'sons_complexes_ent_ion'],
    notes: 'Récit sportif avec structure narrative en cinq temps bien marqués. Repère les difficultés de maintien de la cohérence temporelle (TDAH).',
  },

  // ── Textes spécifiquement ciblés TSA ─────────────────────────────────────
  {
    id: 'tsa-01',
    title: 'Les règles du jeu d\'échecs',
    text: 'Les échecs se jouent sur un plateau de soixante-quatre cases. Chaque joueur dispose de seize pièces : un roi, une reine, deux fous, deux cavaliers, deux tours et huit pions. Le but est de mettre en échec et mat le roi adverse. Les pièces se déplacent chacune selon des règles précises et immuables.',
    gradeLevel: ['CM2', '6eme'],
    difficulty: 'moyen',
    targets: ['TSA', 'general'],
    wordCount: 57,
    phonologicalFeatures: ['vocabulaire_technique', 'enumeration_precise', 'structures_syntaxiques_complexes'],
    notes: 'Texte descriptif avec vocabulaire précis et règles logiques. Les élèves TSA comprennent souvent mieux ce type de texte factuel que les textes narratifs émotionnels.',
  },
  {
    id: 'tsa-02',
    title: 'L\'anniversaire surprise',
    text: 'Quand Marie entra dans la salle, elle trouva tous ses amis cachés derrière les meubles. Ils crièrent tous ensemble : « Surprise ! » Marie ne savait pas quoi dire. Elle regarda ses parents qui souriaient. Elle comprit qu\'ils lui avaient préparé une fête pour lui faire plaisir. Une larme de bonheur coula sur sa joue.',
    gradeLevel: ['CE2', 'CM1'],
    difficulty: 'moyen',
    targets: ['TSA'],
    wordCount: 56,
    phonologicalFeatures: ['sons_complexes_ai_an_ou', 'expressions_emotions', 'inferences_sociales'],
    notes: 'Scénario social avec émotions implicites et inférences nécessaires. Évalue la compréhension de la dimension émotionnelle et sociale (TSA).',
  },
  {
    id: 'tsa-03',
    title: 'Les abeilles et leur ruche',
    text: 'Une ruche peut contenir jusqu\'à cinquante mille abeilles. La reine pond des œufs chaque jour. Les ouvrières récoltent le nectar des fleurs pour fabriquer le miel. Les faux bourdons ont pour seule mission de féconder la reine. Chaque abeille accomplit une tâche précise et indispensable à la survie de la colonie.',
    gradeLevel: ['CM1', 'CM2'],
    difficulty: 'moyen',
    targets: ['TSA', 'general'],
    wordCount: 58,
    phonologicalFeatures: ['vocabulaire_scientifique', 'sons_complexes_eau_ain_on', 'mots_technique'],
    notes: 'Texte documentaire sur un système organisé avec des rôles définis. Vocabulaire précis apprécié des profils TSA.',
  },

  // ── Fable adaptée ─────────────────────────────────────────────────────────
  {
    id: 'fable-01',
    title: 'La cigale et la fourmi (adaptée)',
    text: 'Tout l\'été, la cigale chanta et dansa sans travailler. La fourmi, elle, stockait patiemment sa nourriture pour l\'hiver. Quand les premiers froids arrivèrent, la cigale se retrouva sans provisions. Elle alla frapper à la porte de la fourmi pour lui demander à manger. La fourmi lui répondit : « Tu as chanté tout l\'été ? Eh bien danse maintenant ! »',
    gradeLevel: ['CE2', 'CM1'],
    difficulty: 'moyen',
    targets: ['TDAH', 'TSA', 'general'],
    wordCount: 65,
    phonologicalFeatures: ['sons_complexes_an_in_ou', 'groupes_consonantiques_tr_pr_str', 'discours_direct'],
    notes: 'Fable classique adaptée avec morale implicite. Évalue la compréhension du second degré et de la causalité (TSA) et la cohérence narrative (TDAH).',
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────

export function getTextsByGrade(grade: GradeLevel): ReferenceText[] {
  return TEXTS_BANK.filter(t => t.gradeLevel.includes(grade));
}

export function getTextsByTarget(target: TextTarget): ReferenceText[] {
  return TEXTS_BANK.filter(t => t.targets.includes(target));
}
