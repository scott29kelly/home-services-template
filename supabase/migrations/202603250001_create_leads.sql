create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  lead_type text not null check (lead_type in ('contact', 'booking', 'chat')),
  status text not null default 'new',
  submitted_at timestamptz not null,
  source_label text not null default '',
  source_path text not null default '',
  landing_page text not null default '',
  referrer text not null default '',
  service_name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  referral text not null default '',
  message text not null default '',
  preferred_date date,
  preferred_time text not null default '',
  notes text not null default '',
  page_context text not null default '',
  conversation_preview text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_term text not null default '',
  utm_content text not null default '',
  gclid text not null default '',
  fbclid text not null default '',
  msclkid text not null default '',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_submitted_at_idx on public.leads (submitted_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_lead_type_idx on public.leads (lead_type);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_email_idx on public.leads (email);
