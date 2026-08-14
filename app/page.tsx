import Link from "next/link";
import { ArrowRight, LockKeyhole, PackageCheck, UserRound } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-se-fond text-se-texte">
      <header className="bg-se-primaire px-6 py-6 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div><p className="text-xl font-bold tracking-wide">SUN EXPRESS</p><p className="text-sm text-[#F4D9CF]">Réexpédition France / Antilles / Guyane</p></div>
          <Link href="/gerante/connexion" className="hidden rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10 sm:block">Espace gérante</Link>
        </div>
      </header>

      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F9E5DE] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-se-primaire"><PackageCheck size={14}/> Service d'expédition Sun Express</div>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-se-primaire sm:text-6xl">Expédiez vos colis simplement, depuis un seul espace.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6B5A4F] sm:text-lg">Créez votre demande d'expédition, calculez le poids, générez votre bordereau et transmettez votre demande à Sun Express en quelques étapes.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/demande" className="inline-flex items-center justify-center gap-2 rounded-lg bg-se-primaire px-5 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#6E1D0E]">Créer une demande d'expédition <ArrowRight size={18}/></Link>
              <Link href="/connexion" className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D9C8BA] bg-white px-5 py-3.5 font-bold text-se-primaire hover:bg-se-carte"><UserRound size={18}/> Espace client</Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            <Feature icon={<PackageCheck size={20}/>} title="Demande en ligne" text="Remplissez les informations du destinataire et de votre colis." />
            <Feature icon={<ArrowRight size={20}/>} title="Bordereau automatique" text="Le poids est calculé et votre bordereau peut être généré en PDF." />
            <Feature icon={<LockKeyhole size={20}/>} title="Suivi sécurisé" text="Les demandes envoyées sont enregistrées dans l'espace Sun Express." />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EADFD3] px-6 py-6 text-center text-xs text-[#8A7A6E]">© Sun Express — Plateforme de gestion des expéditions</footer>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-[#EADFD3] bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-se-carte text-se-primaire">{icon}</div><h2 className="mt-4 font-bold text-se-primaire">{title}</h2><p className="mt-2 text-sm leading-6 text-[#6B5A4F]">{text}</p></div>;
}
