"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function GeranteConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session introuvable.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Ce compte n'a pas accès à l'espace gérante.");
      }

      router.push("/gerante");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de se connecter.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-se-fond px-6 py-12">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm font-semibold text-se-primaire">← Retour à Sun Express</Link>
        <div className="mt-6 rounded-2xl border border-[#EADFD3] bg-white p-7 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-se-carte text-se-primaire">
            <LockKeyhole size={21} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-se-primaire">Espace gérante</h1>
          <p className="mt-2 text-sm text-[#6B5A4F]">Connecte-toi pour gérer les demandes d'expédition reçues.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">E-mail</label>
              <input required type="email" autoComplete="email" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">Mot de passe</label>
              <input required type="password" autoComplete="current-password" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {message && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-se-primaire px-4 py-3 font-semibold text-white disabled:opacity-60">
              {busy ? "Connexion..." : "Accéder au tableau de bord"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
