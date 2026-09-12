alter table public.users add column if not exists updated_at timestamptz;
notify pgrst, 'reload schema';
