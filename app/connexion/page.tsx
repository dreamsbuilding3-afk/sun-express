"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const supabase = getSupabase();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
        if (error) throw error;
        if (data.session) router.push("/client");
        else setMessage("Compte créé. Vérifie ton e-mail si une confirmation est demandée.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/client");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-se-fond px-6 py-12"><div className="mx-auto max-w-md"><Link href="/" className="text-sm font-semibold text-se-primaire">← Retour à Sun Express</Link><div className="mt-6 rounded-2xl border border-[#EADFD3] bg-white p-7 shadow-sm"><h1 className="text-2xl font-bold text-se-primaire">Espace client</h1><p className="mt-2 text-sm text-[#6B5A4F]">Crée ton compte pour envoyer et retrouver tes demandes d'expédition.</p><div className="mt-6 flex rounded-lg bg-se-carte p-1"><button onClick={() => setMode("login")} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-white shadow-sm text-se-primaire" : "text-[#6B5A4F]"}`}>Connexion</button><button onClick={() => setMode("signup")} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mode === "signup" ? "bg-white shadow-sm text-se-primaire" : "text-[#6B5A4F]"}`}>Créer un compte</button></div><form onSubmit={submit} className="mt-6 space-y-4">{mode === "signup" && <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">Nom complet</label><input required className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2" value={name} onChange={e => setName(e.target.value)} /></div>}<div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">E-mail</label><input required type="email" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} /></div><div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">Mot de passe</label><input required minLength={6} type="password" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} /></div>{message && <p className="rounded-lg bg-se-carte px-3 py-2 text-sm text-[#6B5A4F]">{message}</p>}<button disabled={busy} className="w-full rounded-lg bg-se-primaire px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}</button></form></div></div></main>;
}
