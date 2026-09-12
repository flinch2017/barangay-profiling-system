alter table public.users add column if not exists resident_id uuid references public.residents(resident_id);
alter table public.users alter column barangay_id drop not null;

-- If your users.role column has a CHECK constraint, include 'resident' in it.

create table if not exists public.resident_claim_requests (
  claim_id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(resident_id),
  barangay_id uuid not null references public.barangays(barangay_id),
  username text not null,
  email text not null,
  password_hash text not null,
  first_name text not null,
  middle_name text,
  last_name text not null,
  suffix text,
  birthdate date not null,
  province text,
  municipality text,
  barangay text,
  street text,
  purok text,
  live_birth_url text,
  baptismal_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(user_id),
  created_at timestamptz not null default now()
);

alter table public.resident_claim_requests add column if not exists claimant_user_id uuid references public.users(user_id);
notify pgrst, 'reload schema';

create table if not exists public.resident_profile_update_requests (
  request_id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(resident_id),
  requester_user_id uuid not null references public.users(user_id),
  changes jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users(user_id),
  created_at timestamptz not null default now()
);

notify pgrst, 'reload schema';
