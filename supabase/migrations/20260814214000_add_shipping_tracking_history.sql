create table if not exists public.shipping_request_events (
  id uuid primary key default gen_random_uuid(),
  shipping_request_id uuid not null references public.shipping_requests(id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists shipping_request_events_request_idx on public.shipping_request_events(shipping_request_id, created_at);

alter table public.shipping_request_events enable row level security;
revoke all on public.shipping_request_events from anon, authenticated;

create policy "clients can read own tracking events"
on public.shipping_request_events
for select
to authenticated
using (exists (select 1 from public.shipping_requests r where r.id = shipping_request_id and r.client_id = auth.uid()));

create or replace function public.log_shipping_request_status()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.shipping_request_events (shipping_request_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

drop trigger if exists shipping_request_status_history on public.shipping_requests;
create trigger shipping_request_status_history
after insert or update of status on public.shipping_requests
for each row execute function public.log_shipping_request_status();

insert into public.shipping_request_events (shipping_request_id, status, created_at)
select r.id, r.status, r.created_at from public.shipping_requests r
where not exists (select 1 from public.shipping_request_events e where e.shipping_request_id = r.id);

create or replace function public.get_public_shipping_tracking(p_document_number text, p_phone text)
returns table (document_number text, status text, created_at timestamptz, updated_at timestamptz, events jsonb)
language sql security definer set search_path = public
as $$
  select r.document_number, r.status, r.created_at, r.updated_at,
    coalesce(jsonb_agg(jsonb_build_object('status', e.status, 'created_at', e.created_at) order by e.created_at asc) filter (where e.id is not null), '[]'::jsonb)
  from public.shipping_requests r
  left join public.shipping_request_events e on e.shipping_request_id = r.id
  where r.document_number = trim(p_document_number)
    and regexp_replace(coalesce(r.recipient->>'indicatifPays','') || coalesce(r.recipient->>'telephoneWhatsapp',''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
  group by r.id, r.document_number, r.status, r.created_at, r.updated_at;
$$;

revoke all on function public.get_public_shipping_tracking(text, text) from public;
grant execute on function public.get_public_shipping_tracking(text, text) to anon, authenticated;
