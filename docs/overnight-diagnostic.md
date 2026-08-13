# Diagnostic Supabase — 2026-08-13

## Constat
La production affiche `Supabase n'est pas encore configuré sur cette application.`

## Cause probable
Le formulaire public est un Client Component et `lib/supabase.ts` lit `process.env.NEXT_PUBLIC_SUPABASE_URL` et `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` côté navigateur. Next.js remplace les variables `NEXT_PUBLIC_*` dans le bundle au moment de `next build`. Si elles ne sont pas présentes dans l'environnement utilisé pour ce build, le navigateur reçoit des valeurs vides et `getSupabase()` déclenche exactement cette erreur.

## Vérifications à faire
- vérifier que les deux clés sont orthographiées exactement comme dans `.env.example`;
- vérifier que l'URL vaut `https://srmluevaweuaasgjyezr.supabase.co` (sans guillemets ni espace);
- vérifier que les variables sont activées pour **Production**;
- lancer un nouveau déploiement depuis `main` après toute modification des variables;
- ne pas confondre la clé publishable avec une autre clé Supabase.

## Indice important
Le code actuel ne peut pas produire cette erreur si les deux variables ont été réellement injectées dans le bundle de production : l'erreur est levée avant toute requête vers Supabase. Il faut donc d'abord résoudre l'injection des variables, avant de diagnostiquer RLS ou la table `shipping_requests`.

## Amélioration indépendante
Le PDF et WhatsApp ne devraient pas dépendre de l'enregistrement Supabase. Une prochaine correction peut laisser ces deux actions fonctionner même si Supabase est temporairement indisponible; seul le bouton d'envoi doit nécessiter la base.
