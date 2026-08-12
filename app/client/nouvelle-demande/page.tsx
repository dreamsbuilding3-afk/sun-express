"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ENTREPOT_EXPEDITEUR, INDICATIFS_PAYS, TERRITOIRES, type Territoire } from "@/types/bordereau";
import { calculerPoidsRetenu, calculerPoidsVolumetrique, genererNumeroBordereau } from "@/lib/calculs";

const input = "w-full rounded-lg border border-[#E4D5C7] bg-white px-3 py-2 text-sm focus:border-se-primaire focus:outline-none";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]";

export default function NouvelleDemande() {
  const router = useRouter();
  const [f, setF] = useState({ nom:"", prenom:"", rue:"", cp:"", ville:"", territoire:"Martinique" as Territoire, indicatif:"+596", tel:"", description:"", valeur:"", colis:"1", poids:"", longueur:"", largeur:"", hauteur:"" });
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const n = (v:string) => Math.max(0, Number(v) || 0);
  const poidsVol = calculerPoidsVolumetrique(n(f.longueur), n(f.largeur), n(f.hauteur));
  const poidsRetenu = calculerPoidsRetenu(n(f.poids), poidsVol);
  const set = (key: keyof typeof f, value: string) => setF(x => ({...x, [key]: value}));

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/connexion"); return; }
      const numero = genererNumeroBordereau();
      const { error } = await supabase.from("shipping_requests").insert({
        client_id: user.id, document_number: numero,
        recipient: { nom:f.nom.trim(), prenom:f.prenom.trim(), rue:f.rue.trim(), codePostal:f.cp.trim(), ville:f.ville.trim(), territoire:f.territoire, indicatifPays:f.indicatif, telephoneWhatsapp:f.tel.trim() },
        declaration: { description:f.description.trim(), valeurDeclaree:n(f.valeur), nombreColis:Math.max(1,n(f.colis)) },
        dimensions: { poidsReel:n(f.poids), longueur:n(f.longueur), largeur:n(f.largeur), hauteur:n(f.hauteur), poidsVolumetrique:poidsVol, poidsRetenu },
      });
      if (error) throw error;
      router.push("/client");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Impossible d'envoyer la demande."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-se-fond pb-16"><header className="bg-se-primaire px-6 py-6 text-white"><div className="mx-auto max-w-4xl"><Link href="/client" className="text-sm text-[#F4D9CF]">← Mon espace client</Link><h1 className="mt-3 text-2xl font-bold">Nouvelle demande d'expédition</h1><p className="mt-1 text-sm text-[#F4D9CF]">Remplis le formulaire : la demande sera enregistrée directement dans ton espace client.</p></div></header><form onSubmit={submit} className="mx-auto mt-8 max-w-4xl space-y-6 px-6"><section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-5 font-bold text-se-primaire">Destinataire</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Nom" value={f.nom} set={v=>set("nom",v)} required/><Field label="Prénom" value={f.prenom} set={v=>set("prenom",v)} required/><div className="sm:col-span-2"><Field label="Adresse" value={f.rue} set={v=>set("rue",v)} required/></div><Field label="Code postal" value={f.cp} set={v=>set("cp",v)} required/><Field label="Ville" value={f.ville} set={v=>set("ville",v)} required/><div><label className={label}>Territoire</label><select className={input} value={f.territoire} onChange={e=>set("territoire",e.target.value)}>{TERRITOIRES.map(x=><option key={x}>{x}</option>)}</select></div><div><label className={label}>Téléphone WhatsApp</label><div className="flex gap-2"><select className="w-28 rounded-lg border border-[#E4D5C7]" value={f.indicatif} onChange={e=>set("indicatif",e.target.value)}>{INDICATIFS_PAYS.map(x=><option key={x.code}>{x.code}</option>)}</select><input required className={input} value={f.tel} onChange={e=>set("tel",e.target.value)} /></div></div></div></section><section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-5 font-bold text-se-primaire">Colis & déclaration</h2><div className="grid gap-4 sm:grid-cols-3"><div className="sm:col-span-3"><Field label="Description des articles" value={f.description} set={v=>set("description",v)} required/></div><Field label="Valeur déclarée (€)" type="number" value={f.valeur} set={v=>set("valeur",v)} required/><Field label="Nombre de colis" type="number" value={f.colis} set={v=>set("colis",v)} required/><Field label="Poids réel (kg)" type="number" value={f.poids} set={v=>set("poids",v)} required/></div></section><section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-5 font-bold text-se-primaire">Dimensions</h2><div className="grid gap-4 sm:grid-cols-3"><Field label="Longueur (cm)" type="number" value={f.longueur} set={v=>set("longueur",v)}/><Field label="Largeur (cm)" type="number" value={f.largeur} set={v=>set("largeur",v)}/><Field label="Hauteur (cm)" type="number" value={f.hauteur} set={v=>set("hauteur",v)}/></div><div className="mt-5 rounded-xl bg-se-carte p-4 text-sm">Poids volumétrique : <b>{poidsVol.toFixed(2)} kg</b> · Poids retenu : <b className="text-se-primaire">{poidsRetenu.toFixed(2)} kg</b></div></section>{message && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{message}</p>}<button disabled={busy} className="w-full rounded-lg bg-se-primaire px-4 py-3 font-semibold text-white shadow-sm disabled:opacity-60">{busy ? "Envoi de la demande..." : "Envoyer ma demande à Sun Express"}</button></form></main>;
}

function Field({label, value, set, type="text", required=false}: {label:string; value:string; set:(v:string)=>void; type?:string; required?:boolean}) { return <div><label className={label}>{label}</label><input required={required} type={type} min={type === "number" ? 0 : undefined} className={input} value={value} onChange={e=>set(e.target.value)}/></div>; }
