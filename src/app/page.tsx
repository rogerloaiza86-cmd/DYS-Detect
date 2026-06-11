import Link from "next/link";
import LogoMark from "@/components/LogoMark";

/* ─── Page d'accueil publique · charte Geronimo Éclaireur v1.0 ───
   Héro marine + constellation, Fraunces pour la voix, boutons
   pastilles, accents par publics (corail/sauge/prune).            */

const STARS = [
  { top: "8%", left: "12%", size: 3, opacity: 0.9 },
  { top: "15%", left: "78%", size: 2, opacity: 0.6 },
  { top: "22%", left: "45%", size: 2, opacity: 0.5 },
  { top: "30%", left: "88%", size: 3, opacity: 0.8 },
  { top: "38%", left: "8%", size: 2, opacity: 0.7 },
  { top: "12%", left: "60%", size: 2, opacity: 0.4 },
  { top: "55%", left: "92%", size: 2, opacity: 0.6 },
  { top: "62%", left: "15%", size: 3, opacity: 0.5 },
  { top: "70%", left: "70%", size: 2, opacity: 0.7 },
  { top: "45%", left: "30%", size: 2, opacity: 0.4 },
  { top: "80%", left: "40%", size: 2, opacity: 0.5 },
  { top: "25%", left: "25%", size: 2, opacity: 0.6 },
];

function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.5l2.6 6.9 7.4.4-5.7 4.7 1.9 7.1L12 16.6l-6.2 4 1.9-7.1L2 8.8l7.4-.4L12 1.5z" />
    </svg>
  );
}

const VALEURS = [
  { num: "01", titre: "Audacieux", texte: "Nous prenons le parti de l'enfant. Nous explorons des chemins que d'autres n'ont pas osé tracer." },
  { num: "02", titre: "Bienveillant", texte: "La douceur n'est pas une option. Chaque mot, chaque couleur, chaque geste porte du soin." },
  { num: "03", titre: "Ludique", texte: "Apprendre est un jeu sérieux. Nos visuels gardent la joie, la curiosité et l'étonnement." },
  { num: "04", titre: "Inclusif", texte: "Nous concevons pour tous : contrastes forts, hiérarchies lisibles, mots simples." },
];

const ETAPES = [
  { icon: "mic", titre: "Écouter", texte: "L'élève lit, raconte ou converse. Geronimo enregistre sa voix et, si vous le souhaitez, une photo de son écriture." },
  { icon: "auto_awesome", titre: "Éclairer", texte: "L'analyse repère des indicateurs de troubles DYS, TDAH et TSA — fondés sur la recherche, jamais sur l'intuition seule." },
  { icon: "explore", titre: "Orienter", texte: "Vous recevez des pistes pédagogiques concrètes et un rapport clair à partager avec les professionnels de santé." },
];

const PUBLICS = [
  { label: "Enseignants", couleur: "bg-[#7fa99b]", texte: "Des repères clairs pour adapter votre classe, sans jargon ni dossier de 40 pages." },
  { label: "Familles", couleur: "bg-[#e87a5d]", texte: "Comprendre ce que vit votre enfant, avec des mots simples et des étapes rassurantes." },
  { label: "Enfants", couleur: "bg-[#6b5b8a]", texte: "Un parcours qui ressemble à un jeu, jamais à un examen. Chacun avance à son rythme." },
];

export default function AccueilPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#17314a]">

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 lg:px-16 py-6">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-9 h-9" color="#f7f3ec" />
          <span className="font-headline text-2xl text-[#f7f3ec]">Geronimo</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/help" className="hidden sm:block text-[#f7f3ec]/80 hover:text-[#f4b942] font-body font-medium text-sm transition-colors">
            Ressources
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[#f4b942] text-[#17314a] font-body font-bold text-sm rounded-full hover:bg-[#fbe3ae] transition-colors"
          >
            Accéder au portail →
          </Link>
        </div>
      </nav>

      {/* ── Héro · ciel marine et constellation ────────────────── */}
      <header className="relative bg-[#17314a] text-[#f7f3ec] overflow-hidden">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#f4b942]"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
            aria-hidden="true"
          />
        ))}

        <div className="relative max-w-5xl mx-auto px-6 lg:px-16 pt-36 pb-28 lg:pt-44 lg:pb-36">
          <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-[#f4b942] mb-6">
            ★ L’éclaireur bienveillant de l’école inclusive
          </p>
          <h1 className="font-headline font-light text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-8">
            Suivre
            <br />
            l’étoile<span className="text-[#f4b942]">.</span>
          </h1>
          <p className="font-body text-lg lg:text-xl leading-relaxed text-[#f7f3ec]/85 max-w-2xl mb-10">
            Geronimo accompagne les enfants, les familles et les équipes éducatives vers une
            école où chaque différence trouve sa place. Des outils d’aide au repérage précoce
            des troubles DYS, TDAH et TSA — pour éclairer sans éblouir.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-[#f4b942] text-[#17314a] font-body font-bold rounded-full hover:bg-[#fbe3ae] transition-colors"
            >
              Découvrir Geronimo →
            </Link>
            <a
              href="#manifeste"
              className="px-8 py-4 border border-[#f7f3ec]/40 text-[#f7f3ec] font-body font-medium rounded-full hover:border-[#f4b942] hover:text-[#f4b942] transition-colors"
            >
              Lire le manifeste
            </a>
          </div>
        </div>

        {/* Vague de l'éclaireur */}
        <svg viewBox="0 0 1440 80" className="block w-full text-[#f7f3ec]" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="currentColor" />
        </svg>
      </header>

      {/* ── Manifeste ──────────────────────────────────────────── */}
      <section id="manifeste" className="max-w-6xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
        <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-[#b5492f] mb-4">02 · Manifeste</p>
        <h2 className="font-headline font-light text-4xl lg:text-5xl mb-6">Une boussole, pas une règle.</h2>
        <blockquote className="font-headline italic text-xl lg:text-2xl text-[#51606f] max-w-3xl mb-14 leading-relaxed">
          « Nous sommes l’éclaireur qui ouvre la voie, le repère qui rassure, et l’étoile qui
          tient la promesse qu’aucun enfant n’avance seul. »
        </blockquote>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALEURS.map(v => (
            <div key={v.num} className="bg-[#fffdf9] border border-[#b3aea1]/30 rounded-md p-6">
              <p className="font-headline text-[#f4b942] text-lg mb-3">{v.num}</p>
              <h3 className="font-headline text-xl mb-2">{v.titre}</h3>
              <p className="font-body text-sm leading-relaxed text-[#51606f]">{v.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trajectoire · comment ça marche ────────────────────── */}
      <section className="bg-[#17314a] text-[#f7f3ec] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-[#f4b942] mb-4">La trajectoire</p>
          <h2 className="font-headline font-light text-4xl lg:text-5xl mb-14">
            Un ciel qui guide<span className="text-[#f4b942]">.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {ETAPES.map((e, i) => (
              <div key={e.titre} className="relative">
                <div className="w-14 h-14 rounded-full bg-[#f4b942] text-[#17314a] flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-2xl">{e.icon}</span>
                </div>
                <h3 className="font-headline text-2xl mb-3">
                  {i + 1}. {e.titre}
                </h3>
                <p className="font-body text-[#f7f3ec]/80 leading-relaxed">{e.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Publics · accents inclusifs ────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
        <p className="font-body text-xs font-semibold tracking-[0.25em] uppercase text-[#4f7a6b] mb-4">Pour qui ?</p>
        <h2 className="font-headline font-light text-4xl lg:text-5xl mb-14">On avance ensemble, à son rythme.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PUBLICS.map(p => (
            <div key={p.label} className="bg-[#fffdf9] border border-[#b3aea1]/30 rounded-md p-8">
              <span className={`inline-block px-4 py-1.5 ${p.couleur} text-[#f7f3ec] font-body font-bold text-xs tracking-wide uppercase rounded-full mb-5`}>
                {p.label}
              </span>
              <p className="font-body leading-relaxed text-[#51606f]">{p.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 lg:px-16 pb-20">
        <div className="border-2 border-[#f4b942]/60 bg-[#fbe3ae]/30 rounded-md p-6 flex gap-4 items-start">
          <StarMark className="w-5 h-5 text-[#d99e23] shrink-0 mt-1" />
          <p className="font-body text-sm leading-relaxed text-[#51606f]">
            <strong className="text-[#17314a]">Geronimo éclaire, il ne diagnostique pas.</strong>{" "}
            Les indicateurs générés sont une aide au repérage précoce destinée à orienter vers
            les professionnels de santé (orthophonistes, neuropsychologues, médecins). Ils ne
            constituent en aucun cas une évaluation clinique.
          </p>
        </div>
      </section>

      {/* ── Pied de page ───────────────────────────────────────── */}
      <footer className="bg-[#17314a] text-[#f7f3ec]">
        <div className="max-w-6xl mx-auto px-6 lg:px-16 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LogoMark className="w-7 h-7" color="#f7f3ec" />
              <span className="font-headline text-xl">Geronimo</span>
            </div>
            <p className="font-body text-sm text-[#f7f3ec]/70">« Aucun enfant ne doit avancer seul. »</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-body text-sm text-[#f7f3ec]/80">
            <Link href="/dashboard" className="hover:text-[#f4b942] transition-colors">Portail</Link>
            <Link href="/help" className="hover:text-[#f4b942] transition-colors">Ressources</Link>
            <Link href="/mentions-legales" className="hover:text-[#f4b942] transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-[#f4b942] transition-colors">Confidentialité</Link>
            <a href="mailto:contact@geronimo.fr" className="hover:text-[#f4b942] transition-colors">Contact</a>
          </div>
          <p className="font-body text-xs text-[#f7f3ec]/50">@geronimo.eclaireur · Charte v1.0</p>
        </div>
      </footer>
    </div>
  );
}
