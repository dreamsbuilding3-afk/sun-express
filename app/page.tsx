"use client";

import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, PackageCheck, Scale, Send, Truck } from "lucide-react";
import BordereauPDF from "@/components/BordereauPDF";
import { calculerPoidsRetenu, calculerPoidsVolumetrique, genererNumeroBordereau } from "@/lib/calculs";
import { genererQRCodeDataUrl } from "@/lib/qrcode";
import { construireMessageBordereau, genererLienWhatsApp } from "@/lib/whatsapp";
import { getSupabase } from "@/lib/supabase";
import { ENTREPOT_EXPEDITEUR, INDICATIFS_PAYS, TERRITOIRES, type Bordereau, type Territoire } from "@/types/bordereau";

const inputClass = "w-full rounded-lg border border-[#E4D5C7] bg-white px-3 py-2 text-sm text-se-texte placeholder:text-[#B8A99C] focus:border-se-primaire focus:outline-none focus:ring-2 focus:ring-se-primaire/15 transition";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B5A4F]";
const positive = (value: string) => Math.max(0, Number.isFinite(Number(value)) ? Number(value) : 0);

export default function PageBordereau() {
  const [nom, setNom] = useState(""); const [prenom, setPrenom] = useState(""); const [rue, setRue] = useState(""); const [codePostal, setCodePostal] = useState(""); const [ville, setVille] = useState("");
  const [territoire, setTerritoire] = useState<Territoire>("Martinique"); const [indicatifPays, setIndicatifPays] = useState("+596"); const [telephoneWhatsapp, setTelephoneWhatsapp] = useState("");
  const [description, setDescription] = useState(""); const [valeurDeclaree, setValeurDeclaree] = useState(0); const [nombreColis, setNombreColis] = useState(1);
  const [poidsReel, setPoidsReel] = useState(0); const [longueur, setLongueur] = useState(0); const [largeur, setLargeur] = useState(0); const [hauteur, setHauteur] = useState(0);
  const [numero] = useState(() => genererNumeroBordereau()); const [busy, setBusy] = useState(false); const [sending, setSending] = useState(false); const [sent, setSent] = useState(false); const [erreur, setErreur] = useState<string | null>(null);
  const poidsVolumetrique = useMemo(() => calculerPoidsVolumetrique(longueur, largeur, hauteur), [longueur, largeur, hauteur]);
  const poidsRetenu = useMemo(() => calculerPoidsRetenu(poidsReel, poidsVolumetrique), [poidsReel, poidsVolumetrique]);
  const valide = Boolean(nom.trim() && prenom.trim() && rue.trim() && codePostal.trim() && ville.trim() && telephoneWhatsapp.trim() && description.trim() && valeurDeclaree > 0 && poidsReel > 0);
  const construireBordereau = (): Bordereau => ({ numero, dateCreation: new Date().toLocaleDateString("fr-FR"), expediteur: ENTREPOT_EXPEDITEUR, destinataire: { nom: nom.trim(), prenom: prenom.trim(), rue: rue.trim(), codePostal: codePostal.trim(), ville: ville.trim(), territoire, indicatifPays, telephoneWhatsapp: telephoneWhatsapp.trim() }, declaration: { description: description.trim(), valeurDeclaree, nombreColis }, dimensions: { poidsReel, longueur, largeur, hauteur }, poidsVolumetrique, poidsRetenu });

  async function enregistrerDemande() {
    if (!valide) { setErreur("Merci de compléter tous les champs obligatoires avant d'envoyer la demande."); return false; }
    if (sent) return true;
    setErreur(null); setSending(true);
    try {
      const bordereau = construireBordereau();
      const { error } = await getSupabase().from("shipping_requests").insert({ client_id: null, status: "pending", document_number: bordereau.numero, recipient: bordereau.destinataire, declaration: bordereau.declaration, dimensions: { ...bordereau.dimensions, poidsVolumetrique: bordereau.poidsVolumetrique, poidsRetenu: bordereau.poidsRetenu } });
      if (error) throw error;
      setSent(true); return true;
    } catch (error) { console.error(error); setErreur(error instanceof Error ? `Impossible d'envoyer la demande : ${error.message}` : "Impossible d'envoyer la demande à Sun Express."); return false; }
    finally { setSending(false); }
  }

  async function envoyerDemande() {
    await enregistrerDemande();
  }

  async function genererPDF() {
    if (!(await enregistrerDemande())) return;
    setErreur(null); setBusy(true);
    try { const bordereau = construireBordereau(); const qr = await genererQRCodeDataUrl(`SUNEXPRESS|${bordereau.numero}|${bordereau.destinataire.nom}`); const blob = await pdf(<BordereauPDF bordereau={bordereau} qrCodeDataUrl={qr} />).toBlob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `Bordereau-SunExpress-${bordereau.numero}.pdf`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (error) { console.error(error); setErreur("Une erreur est survenue lors de la génération du PDF. Réessayez."); } finally { setBusy(false); }
  }

  async function partagerWhatsApp() {
    if (!(await enregistrerDemande())) return;
    setErreur(null); const bordereau = construireBordereau(); window.open(genererLienWhatsApp(telephoneWhatsapp, indicatifPays, construireMessageBordereau(bordereau)), "_blank", "noopener,noreferrer");
  }

  const NumberField = ({ label, value, setValue, step = "1", placeholder }: { label: string; value: number; setValue: (v: number) => void; step?: string; placeholder?: string }) => <div><label className={labelClass}>{label}</label><input className={inputClass} type="number" min={0} step={step} value={value || ""} placeholder={placeholder} onChange={(e) => setValue(positive(e.target.value))} /></div>;
  return <main className="min-h-screen bg-se-fond pb-16">
    <header className="bg-se-primaire px-6 py-8 text-white shadow-md"><div className="mx-auto flex max-w-6xl items-center justify-between"><div><h1 className="text-2xl font-bold tracking-wide">SUN EXPRESS</h1><p className="mt-1 text-sm text-[#F4D9CF]">Génération de bordereaux — Réexpédition France / Antilles / Guyane</p></div><div className="text-right text-sm text-[#F4D9CF]"><p className="text-xs uppercase tracking-wide">Bordereau N°</p><p className="text-lg font-bold text-white">{numero}</p></div></div></header>
    <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-6 lg:grid-cols-3"><div className="space-y-6 lg:col-span-2">
      <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire"><Truck size={16}/>Destinataire</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className={labelClass}>Nom</label><input className={inputClass} value={nom} onChange={e=>setNom(e.target.value)} placeholder="Dupont" /></div><div><label className={labelClass}>Prénom</label><input className={inputClass} value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Marie" /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Adresse (rue)</label><input className={inputClass} value={rue} onChange={e=>setRue(e.target.value)} placeholder="12 rue des Flamboyants" /></div><div><label className={labelClass}>Code postal</label><input className={inputClass} value={codePostal} onChange={e=>setCodePostal(e.target.value)} placeholder="97200" /></div><div><label className={labelClass}>Ville</label><input className={inputClass} value={ville} onChange={e=>setVille(e.target.value)} placeholder="Fort-de-France" /></div>
        <div><label className={labelClass}>Territoire</label><select className={inputClass} value={territoire} onChange={e=>setTerritoire(e.target.value as Territoire)}>{TERRITOIRES.map(t=><option key={t}>{t}</option>)}</select></div><div className="flex gap-2"><div className="w-32"><label className={labelClass}>Indicatif</label><select className={inputClass} value={indicatifPays} onChange={e=>setIndicatifPays(e.target.value)}>{INDICATIFS_PAYS.map(i=><option key={i.code} value={i.code}>{i.code}</option>)}</select></div><div className="flex-1"><label className={labelClass}>Téléphone WhatsApp</label><input className={inputClass} value={telephoneWhatsapp} onChange={e=>setTelephoneWhatsapp(e.target.value)} placeholder="6 07 39 51 78" /></div></div>
      </div></section>
      <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire"><PackageCheck size={16}/>Déclaration du colis & douane</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="sm:col-span-3"><label className={labelClass}>Description des articles</label><input className={inputClass} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Sac, vêtements, accessoires..." /></div><NumberField label="Valeur déclarée (€)" value={valeurDeclaree} setValue={setValeurDeclaree} step="0.01" placeholder="120.00" /><NumberField label="Nombre de colis" value={nombreColis} setValue={v=>setNombreColis(Math.max(1,v))} /></div></section>
      <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire"><Scale size={16}/>Calculateur de poids</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-4"><NumberField label="Poids réel (kg)" value={poidsReel} setValue={setPoidsReel} step="0.01" placeholder="3.20"/><NumberField label="Longueur (cm)" value={longueur} setValue={setLongueur} placeholder="40"/><NumberField label="Largeur (cm)" value={largeur} setValue={setLargeur} placeholder="30"/><NumberField label="Hauteur (cm)" value={hauteur} setValue={setHauteur} placeholder="25"/></div><div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-se-carte p-4 sm:grid-cols-3"><div><p className="text-xs uppercase text-[#6B5A4F]">Poids réel</p><p className="text-lg font-bold">{poidsReel.toFixed(2)} kg</p></div><div><p className="text-xs uppercase text-[#6B5A4F]">Poids volumétrique</p><p className="text-lg font-bold">{poidsVolumetrique.toFixed(2)} kg</p><p className="text-[11px] text-[#8A7A6E]">(L × l × H) / 5000</p></div><div><p className="text-xs uppercase text-se-primaire">Poids retenu</p><p className="text-xl font-extrabold text-se-primaire">{poidsRetenu.toFixed(2)} kg</p><p className="text-[11px] text-[#8A7A6E]">{poidsVolumetrique > poidsReel ? "Volumétrique retenu" : "Poids réel retenu"}</p></div></div></section>
      {erreur && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}
      {sent && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Demande envoyée à Sun Express. Le numéro de bordereau est {numero}.</p>}
    </div>
    <aside><div className="sticky top-6 space-y-4 rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm"><h2 className="text-sm font-bold uppercase tracking-wide text-se-primaire">Récapitulatif</h2><div className="space-y-2 text-sm"><Recap label="Destinataire" value={prenom || nom ? `${prenom} ${nom}` : "—"}/><Recap label="Territoire" value={territoire}/><Recap label="Nb. colis" value={String(nombreColis)}/><Recap label="Valeur déclarée" value={`${valeurDeclaree.toFixed(2)} €`}/><Recap label="Poids retenu" value={`${poidsRetenu.toFixed(2)} kg`} accent/></div><div className="space-y-3 pt-2">
      <button onClick={envoyerDemande} disabled={sending || sent} className="flex w-full items-center justify-center gap-2 rounded-lg bg-se-primaire px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6E1D0E] disabled:cursor-not-allowed disabled:opacity-60"><Send size={16}/>{sending ? "Envoi en cours..." : sent ? "Demande envoyée ✓" : "Envoyer ma demande à Sun Express"}</button>
      <button onClick={genererPDF} disabled={busy || sending} className="flex w-full items-center justify-center gap-2 rounded-lg border border-se-primaire bg-white px-4 py-3 text-sm font-semibold text-se-primaire transition hover:bg-se-carte disabled:opacity-60"><Download size={16}/>{busy ? "Génération..." : "Télécharger le bordereau PDF"}</button>
      <button onClick={partagerWhatsApp} disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-lg border border-se-primaire bg-white px-4 py-3 text-sm font-semibold text-se-primaire transition hover:bg-se-carte disabled:opacity-60"><Send size={16}/>Partager sur WhatsApp</button>
    </div><p className="pt-1 text-[11px] leading-relaxed text-[#8A7A6E]">La demande est enregistrée automatiquement dans l'espace Sun Express. Le PDF et WhatsApp restent disponibles ensuite.</p></div></aside></div>
  </main>;
}

function Recap({ label, value, accent=false }: { label:string; value:string; accent?:boolean }) { return <div className="flex items-center justify-between border-b border-[#F0E6DB] pb-2"><span className="text-[#6B5A4F]">{label}</span><span className={accent ? "font-bold text-se-primaire" : "font-medium text-se-texte"}>{value}</span></div>; }
