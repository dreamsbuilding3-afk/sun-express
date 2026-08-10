"use client";

import { useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Send, Download, PackageCheck, Scale, Truck } from "lucide-react";

import BordereauPDF from "@/components/BordereauPDF";
import { genererQRCodeDataUrl } from "@/lib/qrcode";
import {
  calculerPoidsVolumetrique,
  calculerPoidsRetenu,
  genererNumeroBordereau,
} from "@/lib/calculs";
import { construireMessageBordereau, genererLienWhatsApp } from "@/lib/whatsapp";
import {
  ENTREPOT_EXPEDITEUR,
  TERRITOIRES,
  INDICATIFS_PAYS,
  type Territoire,
  type Bordereau,
} from "@/types/bordereau";

const champClasse =
  "w-full rounded-lg border border-[#E4D5C7] bg-white px-3 py-2 text-sm text-se-texte " +
  "placeholder:text-[#B8A99C] focus:border-se-primaire focus:outline-none focus:ring-2 focus:ring-se-primaire/15 transition";

const labelClasse = "mb-1.5 block text-xs font-semibold text-[#6B5A4F] uppercase tracking-wide";

export default function PageBordereau() {
  // --- Destinataire ---
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [rue, setRue] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [territoire, setTerritoire] = useState<Territoire>("Martinique");
  const [indicatifPays, setIndicatifPays] = useState("+596");
  const [telephoneWhatsapp, setTelephoneWhatsapp] = useState("");

  // --- Déclaration douane ---
  const [description, setDescription] = useState("");
  const [valeurDeclaree, setValeurDeclaree] = useState<number>(0);
  const [nombreColis, setNombreColis] = useState<number>(1);

  // --- Poids & dimensions ---
  const [poidsReel, setPoidsReel] = useState<number>(0);
  const [longueur, setLongueur] = useState<number>(0);
  const [largeur, setLargeur] = useState<number>(0);
  const [hauteur, setHauteur] = useState<number>(0);

  const [numeroBordereau] = useState<string>(() => genererNumeroBordereau());
  const [genereEnCours, setGenereEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const poidsVolumetrique = useMemo(
    () => calculerPoidsVolumetrique(longueur, largeur, hauteur),
    [longueur, largeur, hauteur]
  );

  const poidsRetenu = useMemo(
    () => calculerPoidsRetenu(poidsReel, poidsVolumetrique),
    [poidsReel, poidsVolumetrique]
  );

  const volumetriqueSuperieur = poidsVolumetrique > poidsReel;

  const formulaireValide = Boolean(
    nom &&
      prenom &&
      rue &&
      codePostal &&
      ville &&
      telephoneWhatsapp &&
      description &&
      valeurDeclaree > 0 &&
      poidsReel > 0
  );

  function construireBordereau(): Bordereau {
    return {
      numero: numeroBordereau,
      dateCreation: new Date().toLocaleDateString("fr-FR"),
      expediteur: ENTREPOT_EXPEDITEUR,
      destinataire: {
        nom,
        prenom,
        rue,
        codePostal,
        ville,
        territoire,
        indicatifPays,
        telephoneWhatsapp,
      },
      declaration: { description, valeurDeclaree, nombreColis },
      dimensions: { poidsReel, longueur, largeur, hauteur },
      poidsVolumetrique,
      poidsRetenu,
    };
  }

  async function genererEtTelechargerPDF() {
    if (!formulaireValide) {
      setErreur("Merci de compléter tous les champs obligatoires avant de générer le bordereau.");
      return;
    }
    setErreur(null);
    setGenereEnCours(true);
    try {
      const bordereau = construireBordereau();
      const contenuQR = `SUNEXPRESS|${bordereau.numero}|${bordereau.destinataire.nom}`;
      const qrCodeDataUrl = await genererQRCodeDataUrl(contenuQR);

      const document = <BordereauPDF bordereau={bordereau} qrCodeDataUrl={qrCodeDataUrl} />;
      const blob = await pdf(document).toBlob();

      const url = URL.createObjectURL(blob);
      const lien = window.document.createElement("a");
      lien.href = url;
      lien.download = `Bordereau-SunExpress-${bordereau.numero}.pdf`;
      lien.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setErreur("Une erreur est survenue lors de la génération du PDF. Réessayez.");
    } finally {
      setGenereEnCours(false);
    }
  }

  function partagerSurWhatsApp() {
    if (!formulaireValide) {
      setErreur("Merci de compléter tous les champs obligatoires avant de partager sur WhatsApp.");
      return;
    }
    setErreur(null);
    const bordereau = construireBordereau();
    const message = construireMessageBordereau(bordereau);
    const lien = genererLienWhatsApp(telephoneWhatsapp, indicatifPays, message);
    window.open(lien, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-se-fond pb-16">
      {/* Bandeau d'en-tête */}
      <header className="bg-se-primaire px-6 py-8 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">SUN EXPRESS</h1>
            <p className="mt-1 text-sm text-[#F4D9CF]">
              Génération de bordereaux — Réexpédition France / Antilles / Guyane
            </p>
          </div>
          <div className="text-right text-sm text-[#F4D9CF]">
            <p className="text-xs uppercase tracking-wide">Bordereau N°</p>
            <p className="text-lg font-bold text-white">{numeroBordereau}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 px-6 lg:grid-cols-3">
        {/* Colonne formulaire */}
        <div className="space-y-6 lg:col-span-2">
          {/* Destinataire */}
          <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire">
              <Truck size={16} /> Destinataire
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasse}>Nom</label>
                <input className={champClasse} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" />
              </div>
              <div>
                <label className={labelClasse}>Prénom</label>
                <input className={champClasse} value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Marie" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClasse}>Adresse (rue)</label>
                <input className={champClasse} value={rue} onChange={(e) => setRue(e.target.value)} placeholder="12 rue des Flamboyants" />
              </div>
              <div>
                <label className={labelClasse}>Code postal</label>
                <input className={champClasse} value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="97200" />
              </div>
              <div>
                <label className={labelClasse}>Ville</label>
                <input className={champClasse} value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Fort-de-France" />
              </div>
              <div>
                <label className={labelClasse}>Territoire</label>
                <select
                  className={champClasse}
                  value={territoire}
                  onChange={(e) => setTerritoire(e.target.value as Territoire)}
                >
                  {TERRITOIRES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="w-32">
                  <label className={labelClasse}>Indicatif</label>
                  <select
                    className={champClasse}
                    value={indicatifPays}
                    onChange={(e) => setIndicatifPays(e.target.value)}
                  >
                    {INDICATIFS_PAYS.map((i) => (
                      <option key={i.code} value={i.code}>
                        {i.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClasse}>Téléphone WhatsApp</label>
                  <input
                    className={champClasse}
                    value={telephoneWhatsapp}
                    onChange={(e) => setTelephoneWhatsapp(e.target.value)}
                    placeholder="6 07 39 51 78"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Déclaration douane */}
          <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire">
              <PackageCheck size={16} /> Déclaration du colis & douane
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className={labelClasse}>Description des articles</label>
                <input
                  className={champClasse}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sac Michael Kors, 2 t-shirts Ralph Lauren..."
                />
              </div>
              <div>
                <label className={labelClasse}>Valeur déclarée (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={champClasse}
                  value={valeurDeclaree || ""}
                  onChange={(e) => setValeurDeclaree(Math.max(0, Number(e.target.value)))}
                  placeholder="120.00"
                />
              </div>
              <div>
                <label className={labelClasse}>Nombre de colis</label>
                <input
                  type="number"
                  min={1}
                  className={champClasse}
                  value={nombreColis}
                  onChange={(e) => setNombreColis(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
          </section>

          {/* Poids & dimensions */}
          <section className="rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-se-primaire">
              <Scale size={16} /> Calculateur de poids & tarification
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className={labelClasse}>Poids réel (kg)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={champClasse}
                  value={poidsReel || ""}
                  onChange={(e) => setPoidsReel(Math.max(0, Number(e.target.value)))}
                  placeholder="3.20"
                />
              </div>
              <div>
                <label className={labelClasse}>Longueur (cm)</label>
                <input
                  type="number"
                  min={0}
                  className={champClasse}
                  value={longueur || ""}
                  onChange={(e) => setLongueur(Math.max(0, Number(e.target.value)))}
                  placeholder="40"
                />
              </div>
              <div>
                <label className={labelClasse}>Largeur (cm)</label>
                <input
                  type="number"
                  min={0}
                  className={champClasse}
                  value={largeur || ""}
                  onChange={(e) => setLargeur(Math.max(0, Number(e.target.value)))}
                  placeholder="30"
                />
              </div>
              <div>
                <label className={labelClasse}>Hauteur (cm)</label>
                <input
                  type="number"
                  min={0}
                  className={champClasse}
                  value={hauteur || ""}
                  onChange={(e) => setHauteur(Math.max(0, Number(e.target.value)))}
                  placeholder="25"
                />
              </div>
            </div>

            {/* Résultat du calcul, en direct */}
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-se-carte p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B5A4F]">Poids réel</p>
                <p className="text-lg font-bold text-se-texte">{poidsReel.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6B5A4F]">
                  Poids volumétrique
                </p>
                <p className="text-lg font-bold text-se-texte">
                  {poidsVolumetrique.toFixed(2)} kg
                </p>
                <p className="text-[11px] text-[#8A7A6E]">(L × l × H) / 5000</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-se-primaire">
                  Poids retenu (facturable)
                </p>
                <p className="text-xl font-extrabold text-se-primaire">
                  {poidsRetenu.toFixed(2)} kg
                </p>
                <p className="text-[11px] text-[#8A7A6E]">
                  {volumetriqueSuperieur ? "Volumétrique retenu" : "Poids réel retenu"}
                </p>
              </div>
            </div>
          </section>

          {erreur && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {erreur}
            </p>
          )}
        </div>

        {/* Colonne récapitulatif / actions */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-[#EADFD3] bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-se-primaire">
              Récapitulatif
            </h2>
            <div className="space-y-2 text-sm">
              <RecapLigne label="Destinataire" valeur={prenom || nom ? `${prenom} ${nom}` : "—"} />
              <RecapLigne label="Territoire" valeur={territoire} />
              <RecapLigne label="Nb. colis" valeur={String(nombreColis)} />
              <RecapLigne label="Valeur déclarée" valeur={`${valeurDeclaree.toFixed(2)} €`} />
              <RecapLigne label="Poids retenu" valeur={`${poidsRetenu.toFixed(2)} kg`} accent />
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={genererEtTelechargerPDF}
                disabled={genereEnCours}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-se-primaire px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6E1D0E] disabled:opacity-60"
              >
                <Download size={16} />
                {genereEnCours ? "Génération..." : "Télécharger le bordereau PDF"}
              </button>
              <button
                onClick={partagerSurWhatsApp}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-se-primaire bg-white px-4 py-3 text-sm font-semibold text-se-primaire transition hover:bg-se-carte"
              >
                <Send size={16} />
                Générer & partager sur WhatsApp
              </button>
            </div>

            <p className="pt-1 text-[11px] leading-relaxed text-[#8A7A6E]">
              Les champs marqués obligatoires (nom, prénom, adresse, téléphone,
              description, valeur déclarée, poids réel) doivent être renseignés
              avant de générer le bordereau ou d'envoyer le message WhatsApp.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function RecapLigne({
  label,
  valeur,
  accent = false,
}: {
  label: string;
  valeur: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#F0E6DB] pb-2">
      <span className="text-[#6B5A4F]">{label}</span>
      <span className={accent ? "font-bold text-se-primaire" : "font-medium text-se-texte"}>
        {valeur}
      </span>
    </div>
  );
}

