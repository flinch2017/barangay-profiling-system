-- Links each resident claim request to the resident account that submitted it.
alter table public.resident_claim_requests
  add column if not exists claimant_user_id uuid
  references public.users(user_id);

-- Refresh PostgREST's schema cache so the API sees the new column immediately.
notify pgrst, 'reload schema';
