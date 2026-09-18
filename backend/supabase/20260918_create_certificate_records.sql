create table if not exists public.certificate_records (
  certificate_id uuid primary key default gen_random_uuid(),
  barangay_id uuid not null references public.barangays(barangay_id),
  resident_id uuid references public.residents(resident_id) on delete set null,
  certificate_type text not null,
  certificate_title text not null,
  status text not null default 'draft' check (status in ('draft', 'issued')),
  resident_name text not null,
  purpose text,
  issued_date date,
  form jsonb not null default '{}'::jsonb,
  resident_snapshot jsonb not null,
  punong_barangay jsonb,
  created_by uuid references public.users(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists certificate_records_barangay_created_idx
  on public.certificate_records (barangay_id, created_at desc);

notify pgrst, 'reload schema';
