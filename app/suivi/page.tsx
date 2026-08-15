"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, PackageSearch, Truck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

const STATUS_LABELS: Record<string, string> = {
  pending: "Demande reçue",
  validated: "Demande validée",
  processed: "Colis en préparation",
  completed: "Expédition terminée",
};

const STATUS_ORDER = ["pending", "validated", "processed", "completed"];

type TrackingResult = {
  document_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  events: Array<{ status: string; created_at: string }>;
};

export default function SuiviPage() {
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setResult(null);

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc("get_public_shipping_tracking", {
        p_document_number: documentNumber.trim(),
        p_phone: phone.trim(),
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setMessage("Aucune expédition trouvée. Vérifie le numéro de bordereau et le téléphone utilisés lors de la demande.");
        return;
      }
      setResult(row as TrackingResult);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible de récupérer le suivi.");
    } finally {
      setBusy(false);
    }
  }

  const currentIndex = result ? STATUS_ORDER.indexOf(result.status) : -1;

  return (
    <main className="min-h-screen bg-se-fond pb-16 text-se-texte">
      <header className="bg-se-primaire px-6 py-6 text-white shadow-md">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#F4D9CF] hover:text-white"><ArrowLeft size={15} /> Retour à Sun Express</Link>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[#F4D9CF]">SUN EXPRESS</p>
          <h1 className="mt-1 text-3xl font-bold">Suivre mon expédition</h1>
          <p className="mt-2 text-sm text-[#F4D9CF]">Consulte l'avancement de ta demande avec ton numéro de bordereau.</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pt-8">
        <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-se-carte text-se-primaire"><PackageSearch size={20} /></div>
            <div><h2 className="font-bold text-se-primaire">Retrouver une demande</h2><p className="mt-1 text-sm text-[#6B5A4F]">Utilise le numéro indiqué sur ton bordereau et le numéro WhatsApp renseigné lors de la demande.</p></div>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">N° de bordereau</label><input required value={documentNumber} onChange={e => setDocumentNumber(e.target.value)} placeholder="SE-2026-8431" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2 outline-none focus:border-se-primaire" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]">Téléphone WhatsApp</label><input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+596 6 07 39 51 78" className="w-full rounded-lg border border-[#E4D5C7] px-3 py-2 outline-none focus:border-se-primaire" /></div>
            <button disabled={busy} className="sm:col-span-2 rounded-lg bg-se-primaire px-4 py-3 font-semibold text-white transition hover:bg-[#6E1D0E] disabled:opacity-60">{busy ? "Recherche..." : "Voir le suivi"}</button>
          </form>

          {message && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
        </section>

        {result && <section className="mt-6 rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#F0E6DB] pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs uppercase tracking-wide text-[#6B5A4F]">Bordereau</p><h2 className="mt-1 text-2xl font-bold text-se-primaire">{result.document_number}</h2></div>
            <div className="rounded-full bg-se-carte px-4 py-2 text-sm font-semibold text-se-primaire">{STATUS_LABELS[result.status] ?? result.status}</div>
          </div>

          <div className="mt-6 space-y-4">
            {STATUS_ORDER.map((status, index) => {
              const reached = index <= currentIndex;
              const event = result.events?.find(item => item.status === status);
              return <div key={status} className="flex items-start gap-4">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${reached ? "bg-se-primaire text-white" : "bg-se-carte text-[#9A8A7E]"}`}>{reached ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</div>
                <div className="min-w-0 flex-1 border-b border-[#F0E6DB] pb-4"><p className={`font-semibold ${reached ? "text-se-texte" : "text-[#9A8A7E]"}`}>{STATUS_LABELS[status]}</p><p className="mt-1 text-xs text-[#8A7A6E]">{event ? new Date(event.created_at).toLocaleString("fr-FR") : reached ? "Étape atteinte" : "À venir"}</p></div>
              </div>;
            })}
          </div>

          <div className="mt-6 rounded-xl bg-se-carte p-4 text-sm text-[#6B5A4F]"><div className="flex items-center gap-2 font-semibold text-se-primaire"><Truck size={16} /> Dernière mise à jour</div><p className="mt-1">{new Date(result.updated_at).toLocaleString("fr-FR")}</p></div>
        </section>}
      </div>
    </main>
  );
}
