create table if not exists public.shipping_request_satisfaction (
  id uuid primary key default gen_random_uuid(),
  shipping_request_id uuid not null unique references public.shipping_requests(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.shipping_request_satisfaction enable row level security;
revoke all on public.shipping_request_satisfaction from anon, authenticated;

create or replace function public.submit_shipping_satisfaction(
  p_document_number text,
  p_phone text,
  p_rating smallint,
  p_comment text default null
)
returns boolean language plpgsql security definer set search_path = public
as $$
declare v_request_id uuid;
begin
  if p_rating < 1 or p_rating > 5 then return false; end if;
  select r.id into v_request_id from public.shipping_requests r
  where r.document_number = trim(p_document_number)
    and r.status = 'completed'
    and regexp_replace(coalesce(r.recipient->>'indicatifPays','') || coalesce(r.recipient->>'telephoneWhatsapp',''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
  limit 1;
  if v_request_id is null then return false; end if;
  insert into public.shipping_request_satisfaction (shipping_request_id, rating, comment)
  values (v_request_id, p_rating, nullif(trim(p_comment), ''))
  on conflict (shipping_request_id) do nothing;
  return true;
end;
$$;

revoke all on function public.submit_shipping_satisfaction(text, text, smallint, text) from public;
grant execute on function public.submit_shipping_satisfaction(text, text, smallint, text) to anon, authenticated;
