"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, RefreshCw } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const labels: Record<string, string> = { pending: "À traiter", validated: "Validée", processed: "En préparation", completed: "Terminée" };

export default function ClientPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/connexion"); return; }
      setEmail(user.email ?? "");
      const { data, error } = await supabase.from("shipping_requests").select("id, document_number, status, recipient, declaration, dimensions, created_at").order("created_at", { ascending: false });
      if (error) throw error;
      setRequests(data ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Impossible de charger tes demandes."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function logout() { await getSupabase().auth.signOut(); router.replace("/"); }

  return <main className="min-h-screen bg-se-fond pb-16"><header className="bg-se-primaire px-6 py-6 text-white"><div className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="text-xs uppercase tracking-widest text-[#F4D9CF]">SUN EXPRESS</p><h1 className="text-2xl font-bold">Mon espace client</h1><p className="mt-1 text-sm text-[#F4D9CF]">{email}</p></div><button onClick={logout} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"><LogOut size={16}/>Déconnexion</button></div></header><div className="mx-auto max-w-6xl px-6 pt-8"><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADFD3]"><p className="text-xs uppercase text-[#6B5A4F]">Mes demandes</p><p className="mt-2 text-3xl font-bold text-se-primaire">{requests.length}</p></div><div className="rounded-2xl bg-white p-5 shadow-sm border border-[#EADFD3]"><p className="text-xs uppercase text-[#6B5A4F]">À traiter</p><p className="mt-2 text-3xl font-bold text-se-primaire">{requests.filter(r => r.status === "pending").length}</p></div><div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-[#EADFD3]"><div><p className="text-xs uppercase text-[#6B5A4F]">Nouvelle expédition</p><p className="mt-1 text-sm text-[#6B5A4F]">Remplir un nouveau bordereau</p></div><Link href="/" className="rounded-lg bg-se-primaire p-3 text-white"><Plus size={20}/></Link></div></div><section className="mt-8 rounded-2xl border border-[#EADFD3] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#F0E6DB] p-5"><div><h2 className="font-bold text-se-primaire">Mes demandes</h2><p className="text-sm text-[#6B5A4F]">Retrouve toutes tes demandes envoyées à Sun Express.</p></div><button onClick={load} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><RefreshCw size={15}/>Actualiser</button></div>{loading ? <p className="p-6 text-sm text-[#6B5A4F]">Chargement...</p> : error ? <p className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p> : requests.length === 0 ? <div className="p-10 text-center"><p className="font-semibold">Aucune demande pour le moment.</p><Link href="/" className="mt-4 inline-flex rounded-lg bg-se-primaire px-4 py-2 text-sm font-semibold text-white">Créer ma première demande</Link></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-se-carte text-xs uppercase text-[#6B5A4F]"><tr><th className="p-4">Bordereau</th><th className="p-4">Destinataire</th><th className="p-4">Colis</th><th className="p-4">Statut</th><th className="p-4">Date</th></tr></thead><tbody>{requests.map(r => <tr key={r.id} className="border-t border-[#F0E6DB]"><td className="p-4 font-semibold text-se-primaire">{r.document_number}</td><td className="p-4">{r.recipient?.prenom} {r.recipient?.nom}<br/><span className="text-xs text-[#6B5A4F]">{r.recipient?.ville}</span></td><td className="p-4">{r.declaration?.nombreColis ?? "—"}</td><td className="p-4"><span className="rounded-full bg-se-carte px-3 py-1 text-xs font-semibold">{labels[r.status] ?? r.status}</span></td><td className="p-4 text-[#6B5A4F]">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td></tr>)}</tbody></table></div>}</section></div></main>;
}
