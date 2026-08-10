export type Territoire =
  | "Martinique"
  | "Guadeloupe"
  | "Guyane"
  | "Saint-Martin"
  | "Saint-Barthélemy"
  | "La Réunion";

export interface Destinataire {
  nom: string;
  prenom: string;
  rue: string;
  codePostal: string;
  ville: string;
  territoire: Territoire;
  indicatifPays: string;
  telephoneWhatsapp: string;
}

export interface DeclarationDouane {
  description: string;
  valeurDeclaree: number;
  nombreColis: number;
}

export interface Dimensions {
  poidsReel: number;
  longueur: number;
  largeur: number;
  hauteur: number;
}

export interface Expediteur {
  nom: string;
  rue: string;
  codePostal: string;
  ville: string;
  pays: string;
  telephone: string;
}

export interface Bordereau {
  numero: string;
  dateCreation: string;
  expediteur: Expediteur;
  destinataire: Destinataire;
  declaration: DeclarationDouane;
  dimensions: Dimensions;
  poidsVolumetrique: number;
  poidsRetenu: number;
}

/**
 * Adresse de l'entrepôt en France. À adapter avec la vraie adresse
 * de réception des colis avant mise en production.
 */
export const ENTREPOT_EXPEDITEUR: Expediteur = {
  nom: "SUN EXPRESS – Entrepôt de réexpédition",
  rue: "Adresse de l'entrepôt à compléter",
  codePostal: "00000",
  ville: "Ville, France",
  pays: "France",
  telephone: "+33 6 07 39 51 78",
};

export const TERRITOIRES: Territoire[] = [
  "Martinique",
  "Guadeloupe",
  "Guyane",
  "Saint-Martin",
  "Saint-Barthélemy",
  "La Réunion",
];

/** Indicatifs téléphoniques usuels pour les territoires desservis. */
export const INDICATIFS_PAYS: { code: string; label: string }[] = [
  { code: "+596", label: "+596 (Martinique)" },
  { code: "+590", label: "+590 (Guadeloupe / St-Martin)" },
  { code: "+594", label: "+594 (Guyane)" },
  { code: "+262", label: "+262 (La Réunion)" },
];

