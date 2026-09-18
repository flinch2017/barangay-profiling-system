create table if not exists public.resident_registration_requests (
  registration_id uuid primary key default gen_random_uuid(),
  claimant_user_id uuid not null references public.users(user_id) on delete cascade,
  barangay_id uuid not null references public.barangays(barangay_id),
  profile jsonb not null,
  pfp_url text,
  live_birth_url text,
  baptismal_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(user_id),
  created_at timestamptz not null default now()
);

create index if not exists resident_registration_requests_barangay_created_idx
  on public.resident_registration_requests (barangay_id, created_at desc);

notify pgrst, 'reload schema';
