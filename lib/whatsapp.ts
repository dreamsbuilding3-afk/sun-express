import type { Bordereau } from "@/types/bordereau";

export function construireMessageBordereau(bordereau: Bordereau): string {
  return [
    `Bonjour ${bordereau.destinataire.prenom} ${bordereau.destinataire.nom}, voici votre bordereau d'expédition Sun Express N° ${bordereau.numero}.`,
    `Poids retenu : ${bordereau.poidsRetenu.toFixed(2)} kg.`,
    `Valeur déclarée : ${bordereau.declaration.valeurDeclaree.toFixed(2)} €.`,
  ].join(" ");
}

export function genererLienWhatsApp(telephone: string, indicatifPays: string, message: string): string {
  const numeroComplet = `${indicatifPays}${telephone}`.replace(/[^0-9]/g, "");
  return `https://api.whatsapp.com/send?phone=${numeroComplet}&text=${encodeURIComponent(message)}`;
}
