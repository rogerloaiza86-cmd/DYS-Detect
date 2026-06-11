import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

export const metadata: Metadata = {
  title: "Mentions légales — Geronimo Éclaireur",
};

export default function MentionsLegalesPage() {
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
        <h1 className="font-headline font-light text-4xl mb-10">Mentions légales<span className="text-[#f4b942]">.</span></h1>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Éditeur du site</h2>
          <p className="text-[#51606f]">
            Geronimo Éclaireur — [Dénomination sociale à compléter]<br />
            [Adresse à compléter]<br />
            Contact : <a href="mailto:contact@geronimo.fr" className="text-[#17314a] underline">contact@geronimo.fr</a><br />
            Directeur de la publication : [À compléter]
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Hébergement</h2>
          <p className="text-[#51606f]">
            Application hébergée par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.<br />
            Base de données hébergée par Supabase Inc. (région à préciser selon le projet).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Propriété intellectuelle</h2>
          <p className="text-[#51606f]">
            L&rsquo;identité visuelle Geronimo (logo, charte graphique v1.0) et les contenus de ce
            site sont protégés. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-headline text-2xl mb-3">Avertissement</h2>
          <p className="text-[#51606f]">
            Geronimo Éclaireur est un outil d&rsquo;aide au repérage précoce destiné aux équipes
            éducatives. Les indicateurs générés ne constituent pas un diagnostic médical et ne
            remplacent jamais l&rsquo;avis d&rsquo;un professionnel de santé.
          </p>
        </section>

        <p className="text-sm text-[#51606f] mt-12">
          Voir aussi : <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>
        </p>
      </main>
    </div>
  );
}
