import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Geronimo Éclaireur",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#f7f3ec] text-[#17314a]">
      <nav className="bg-[#17314a] px-6 lg:px-16 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="w-9 h-9" color="#f7f3ec" />
          <span className="font-headline text-2xl text-[#f7f3ec]">Geronimo</span>
        </Link>
        <Link href="/" className="text-[#f7f3ec]/70 hover:text-[#f4b942] font-body text-sm transition-colors">
          ← Retour à l&rsquo;accueil
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 font-body leading-relaxed">
        <h1 className="font-headline font-light text-4xl mb-4">
          Politique de confidentialité<span className="text-[#f4b942]">.</span>
        </h1>
        <p className="text-[#51606f] mb-10">
          Geronimo traite des données concernant des enfants mineurs. Nous appliquons le principe
          de minimisation : ne collecter que le nécessaire, le protéger, et l&rsquo;effacer quand il
          n&rsquo;est plus utile.
        </p>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Données collectées</h2>
          <ul className="list-disc pl-6 text-[#51606f] space-y-1">
            <li><strong className="text-[#17314a]">Comptes enseignants</strong> : adresse e-mail (authentification Supabase).</li>
            <li><strong className="text-[#17314a]">Élèves</strong> : prénom, nom, classe, âge, statut de consentement, niveau d&rsquo;indicateur.</li>
            <li><strong className="text-[#17314a]">Analyses</strong> : transcription de l&rsquo;exercice oral, photo d&rsquo;écriture manuscrite (optionnelle), métadonnées prosodiques, indicateurs générés.</li>
          </ul>
          <p className="text-[#51606f] mt-3">
            Les enregistrements audio sont traités pour transcription puis ne sont pas conservés
            sur nos serveurs. Aucune donnée n&rsquo;est utilisée à des fins publicitaires.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Base légale et consentement</h2>
          <p className="text-[#51606f]">
            Le traitement repose sur la mission d&rsquo;intérêt éducatif et sur le consentement
            écrit du représentant légal pour les élèves concernés. Chaque action de consentement
            (accord, retrait, export, suppression) est tracée dans un journal d&rsquo;audit.
            L&rsquo;utilisation des données à des fins de recherche n&rsquo;est possible que pour
            les élèves dont le consentement est signé, après pseudonymisation (identifiants P001,
            P002… sans nom ni prénom).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Accès et sécurité</h2>
          <p className="text-[#51606f]">
            Chaque enseignant n&rsquo;accède qu&rsquo;aux élèves qu&rsquo;il a lui-même enregistrés
            (isolation par compte au niveau de la base de données). Les échanges sont chiffrés
            (HTTPS/TLS). Les indicateurs générés ne constituent pas un diagnostic médical.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Sous-traitants</h2>
          <ul className="list-disc pl-6 text-[#51606f] space-y-1">
            <li>Supabase (base de données, authentification)</li>
            <li>Google (Gemini — transcription et analyse prosodique des enregistrements)</li>
            <li>Anthropic (Claude — analyse des indicateurs)</li>
            <li>Vercel (hébergement de l&rsquo;application)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Vos droits</h2>
          <p className="text-[#51606f]">
            Conformément au RGPD, le représentant légal peut exercer les droits d&rsquo;accès, de
            rectification, d&rsquo;effacement, de limitation et d&rsquo;opposition en écrivant à{" "}
            <a href="mailto:contact@geronimo.fr" className="text-[#17314a] underline">contact@geronimo.fr</a>.
            La suppression d&rsquo;un élève efface ses analyses associées. Vous pouvez également
            saisir la CNIL (cnil.fr).
          </p>
        </section>

        <p className="text-sm text-[#51606f] mt-12">
          Dernière mise à jour : juin 2026 · Voir aussi :{" "}
          <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        </p>
      </main>
    </div>
  );
}
