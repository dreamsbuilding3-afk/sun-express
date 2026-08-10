export function calculerPoidsVolumetrique(longueurCm: number, largeurCm: number, hauteurCm: number): number {
  if (longueurCm <= 0 || largeurCm <= 0 || hauteurCm <= 0) return 0;
  return (longueurCm * largeurCm * hauteurCm) / 5000;
}

export function calculerPoidsRetenu(poidsReelKg: number, poidsVolumetriqueKg: number): number {
  return Math.max(poidsReelKg || 0, poidsVolumetriqueKg || 0);
}

export function genererNumeroBordereau(): string {
  const annee = new Date().getFullYear();
  const alea = Math.floor(1000 + Math.random() * 9000);
  return `SE-${annee}-${alea}`;
}

export function formaterPoids(poidsKg: number): string {
  return `${poidsKg.toFixed(2)} kg`;
}

export function formaterMontant(montant: number): string {
  return `${montant.toFixed(2)} €`;
}
