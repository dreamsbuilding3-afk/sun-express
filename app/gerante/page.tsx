"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock3, Eye, LogOut, Package, RefreshCw, Search, Truck } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Status = "pending" | "validated" | "processed" | "completed";
type RequestRow = {
  id: string;
  document_number: string | null;
  status: string;
  recipient: Record<string, unknown> | null;
  declaration: Record<string, unknown> | null;
  dimensions: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "À traiter",
  validated: "Validée",
  processed: "En préparation",
  completed: "Terminée",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  validated: "bg-blue-50 text-blue-700 border-blue-200",
  processed: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

const STATUS_OPTIONS: Status[] = ["pending", "validated", "processed", "completed"];

function text(value: unknown) {
  return typeof value === "string" ? value : value == null ? "—" : String(value);
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function GerantePage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function ensureAdmin() {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/gerante/connexion");
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      router.replace("/gerante/connexion");
      return null;
    }

    return profile;
  }

  async function loadRequests() {
    setLoading(true);
    setError("");
    try {
      const supabase = getSupabase();
      const profile = await ensureAdmin();
      if (!profile) return;

      const { data, error: requestError } = await supabase
        .from("shipping_requests")
        .select("id, document_number, status, recipient, declaration, dimensions, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (requestError) throw requestError;
      setRequests((data ?? []) as RequestRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de charger les demandes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function updateStatus(id: string, status: Status) {
    setUpdating(id);
    setError("");
    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.from("shipping_requests").update({ status }).eq("id", id);
      if (updateError) throw updateError;
      setRequests(current => current.map(request => request.id === id ? { ...request, status, updated_at: new Date().toISOString() } : request));
      setSelected(current => current?.id === id ? { ...current, status, updated_at: new Date().toISOString() } : current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de modifier le statut.");
    } finally {
      setUpdating(null);
    }
  }

  async function logout() {
    await getSupabase().auth.signOut();
    router.replace("/");
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter(request => {
      const matchesStatus = filter === "all" || request.status === filter;
      const recipient = request.recipient ?? {};
      const haystack = [
        request.document_number,
        recipient.nom,
        recipient.prenom,
        recipient.ville,
        recipient.telephoneWhatsapp,
        recipient.territoire,
      ].map(text).join(" ").toLowerCase();
      return matchesStatus && (!query || haystack.includes(query));
    });
  }, [filter, requests, search]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    validated: requests.filter(r => r.status === "validated").length,
    processed: requests.filter(r => r.status === "processed").length,
    completed: requests.filter(r => r.status === "completed").length,
  }), [requests]);

  return (
    <main className="min-h-screen bg-se-fond pb-16">
      <header className="bg-se-primaire px-6 py-6 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#F4D9CF]">SUN EXPRESS</p>
            <h1 className="mt-1 text-2xl font-bold">Tableau de bord gérante</h1>
            <p className="mt-1 text-sm text-[#F4D9CF]">Gestion des demandes d'expédition</p>
          </div>
          <button onClick={logout} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Package size={19} />} label="Total des demandes" value={counts.all} />
          <StatCard icon={<Clock3 size={19} />} label="À traiter" value={counts.pending} accent />
          <StatCard icon={<Truck size={19} />} label="En préparation" value={counts.processed} />
          <StatCard icon={<Check size={19} />} label="Terminées" value={counts.completed} />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#EADFD3] bg-white shadow-sm">
          <div className="border-b border-[#F0E6DB] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-bold text-se-primaire">Demandes reçues</h2>
                <p className="mt-1 text-sm text-[#6B5A4F]">Toutes les demandes envoyées depuis le formulaire public.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A6E]" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full rounded-lg border border-[#E4D5C7] py-2 pl-9 pr-3 text-sm outline-none focus:border-se-primaire sm:w-56" />
                </div>
                <button onClick={() => void loadRequests()} className="flex items-center justify-center gap-2 rounded-lg border border-[#E4D5C7] px-3 py-2 text-sm font-semibold text-[#6B5A4F] hover:bg-se-carte">
                  <RefreshCw size={15} /> Actualiser
                </button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label={`Toutes (${counts.all})`} />
              <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label={`À traiter (${counts.pending})`} />
              <FilterButton active={filter === "validated"} onClick={() => setFilter("validated")} label={`Validées (${counts.validated})`} />
              <FilterButton active={filter === "processed"} onClick={() => setFilter("processed")} label={`En préparation (${counts.processed})`} />
              <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")} label={`Terminées (${counts.completed})`} />
            </div>
          </div>

          {error && <p role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {loading ? <p className="p-8 text-sm text-[#6B5A4F]">Chargement des demandes...</p> : filtered.length === 0 ? <div className="p-10 text-center"><p className="font-semibold text-se-texte">Aucune demande ne correspond aux filtres.</p></div> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-se-carte text-xs uppercase tracking-wide text-[#6B5A4F]">
                  <tr><th className="p-4">Bordereau</th><th className="p-4">Client</th><th className="p-4">Destination</th><th className="p-4">Colis</th><th className="p-4">Poids</th><th className="p-4">Statut</th><th className="p-4">Date</th><th className="p-4">Détails</th></tr>
                </thead>
                <tbody>
                  {filtered.map(request => {
                    const recipient = request.recipient ?? {};
                    const declaration = request.declaration ?? {};
                    const dimensions = request.dimensions ?? {};
                    return <tr key={request.id} className="border-t border-[#F0E6DB] hover:bg-[#FCF9F6]">
                      <td className="p-4 font-bold text-se-primaire">{text(request.document_number)}</td>
                      <td className="p-4"><span className="font-semibold">{text(recipient.prenom)} {text(recipient.nom)}</span><br /><span className="text-xs text-[#8A7A6E]">{text(recipient.telephoneWhatsapp)}</span></td>
                      <td className="p-4">{text(recipient.ville)}<br /><span className="text-xs text-[#8A7A6E]">{text(recipient.territoire)}</span></td>
                      <td className="p-4">{text(declaration.nombreColis)}</td>
                      <td className="p-4 font-semibold">{numberValue(dimensions.poidsRetenu)?.toFixed(2) ?? "—"} kg</td>
                      <td className="p-4"><StatusSelect request={request} updating={updating === request.id} onChange={status => void updateStatus(request.id, status)} /></td>
                      <td className="p-4 whitespace-nowrap text-[#6B5A4F]">{new Date(request.created_at).toLocaleDateString("fr-FR")}</td>
                      <td className="p-4"><button onClick={() => setSelected(request)} className="inline-flex items-center gap-1 rounded-lg border border-[#E4D5C7] px-3 py-2 text-xs font-semibold text-se-primaire hover:bg-se-carte"><Eye size={14} /> Voir</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selected && <RequestDetails request={selected} onClose={() => setSelected(null)} updating={updating === selected.id} onStatusChange={status => void updateStatus(selected.id, status)} />}
    </main>
  );
}

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return <div className="rounded-2xl border border-[#EADFD3] bg-white p-5 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent ? "bg-[#F9E5DE] text-se-primaire" : "bg-se-carte text-se-primaire"}`}>{icon}</div><p className="mt-4 text-xs uppercase tracking-wide text-[#6B5A4F]">{label}</p><p className="mt-1 text-3xl font-bold text-se-primaire">{value}</p></div>;
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-se-primaire bg-se-primaire text-white" : "border-[#E4D5C7] bg-white text-[#6B5A4F] hover:bg-se-carte"}`}>{label}</button>;
}

function StatusSelect({ request, updating, onChange }: { request: RequestRow; updating: boolean; onChange: (status: Status) => void }) {
  return <select disabled={updating} value={request.status} onChange={e => onChange(e.target.value as Status)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_STYLES[request.status] ?? "border-[#E4D5C7] bg-white text-[#6B5A4F]"}`} aria-label={`Statut de ${request.document_number ?? "la demande"}`}>
    {STATUS_OPTIONS.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
  </select>;
}

function RequestDetails({ request, onClose, updating, onStatusChange }: { request: RequestRow; onClose: () => void; updating: boolean; onStatusChange: (status: Status) => void }) {
  const recipient = request.recipient ?? {};
  const declaration = request.declaration ?? {};
  const dimensions = request.dimensions ?? {};
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onMouseDown={onClose}>
    <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-[#6B5A4F]">Demande</p><h2 className="mt-1 text-2xl font-bold text-se-primaire">{text(request.document_number)}</h2><p className="mt-1 text-sm text-[#8A7A6E]">Reçue le {new Date(request.created_at).toLocaleString("fr-FR")}</p></div><button onClick={onClose} className="rounded-lg border border-[#E4D5C7] px-3 py-2 text-sm font-semibold">Fermer</button></div>
      <div className="mt-6 rounded-xl bg-se-carte p-4"><p className="text-xs uppercase tracking-wide text-[#6B5A4F]">Statut</p><div className="mt-2"><StatusSelect request={request} updating={updating} onChange={onStatusChange} /></div></div>
      <DetailSection title="Destinataire"><Detail label="Nom" value={`${text(recipient.prenom)} ${text(recipient.nom)}`} /><Detail label="Adresse" value={text(recipient.rue)} /><Detail label="Ville" value={`${text(recipient.codePostal)} ${text(recipient.ville)}`} /><Detail label="Territoire" value={text(recipient.territoire)} /><Detail label="WhatsApp" value={`${text(recipient.indicatifPays)} ${text(recipient.telephoneWhatsapp)}`} /></DetailSection>
      <DetailSection title="Déclaration"><Detail label="Articles" value={text(declaration.description)} /><Detail label="Valeur déclarée" value={`${text(declaration.valeurDeclaree)} €`} /><Detail label="Nombre de colis" value={text(declaration.nombreColis)} /></DetailSection>
      <DetailSection title="Poids & dimensions"><Detail label="Poids réel" value={`${text(dimensions.poidsReel)} kg`} /><Detail label="Dimensions" value={`${text(dimensions.longueur)} × ${text(dimensions.largeur)} × ${text(dimensions.hauteur)} cm`} /><Detail label="Poids volumétrique" value={`${text(dimensions.poidsVolumetrique)} kg`} /><Detail label="Poids retenu" value={`${text(dimensions.poidsRetenu)} kg`} /></DetailSection>
    </aside>
  </div>;
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6 rounded-xl border border-[#EADFD3] p-4"><h3 className="text-sm font-bold uppercase tracking-wide text-se-primaire">{title}</h3><div className="mt-3 space-y-3">{children}</div></section>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="flex flex-col gap-1 border-b border-[#F0E6DB] pb-2 last:border-0"><span className="text-xs uppercase tracking-wide text-[#8A7A6E]">{label}</span><span className="text-sm font-medium text-se-texte">{value}</span></div>; }
