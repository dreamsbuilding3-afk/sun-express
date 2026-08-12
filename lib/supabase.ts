import type { Bordereau } from "@/types/bordereau";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

export async function enregistrerBordereau(bordereau: Bordereau) {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase n'est pas configuré. Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/shipping_requests`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      document_number: bordereau.numero,
      status: "pending",
      client_id: null,
      recipient: bordereau.destinataire,
      declaration: bordereau.declaration,
      dimensions: {
        ...bordereau.dimensions,
        poidsVolumetrique: bordereau.poidsVolumetrique,
        poidsRetenu: bordereau.poidsRetenu,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase a refusé l'enregistrement (${response.status}). ${details}`);
  }

  const rows = (await response.json()) as Array<{ id: string; document_number: string; status: string }>;
  return rows[0];
}
