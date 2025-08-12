-- 1) Helper function to check current user roles (avoids recursion in RLS)
create or replace function public.current_user_in_roles(roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = any (roles)
  );
$$;

-- 2) Restrict profiles SELECT to user themselves or privileged roles
alter table public.profiles enable row level security;

-- Drop overly-permissive policy if it exists
drop policy if exists "Users can view all profiles" on public.profiles;

-- Ensure self-view policy exists
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Users can view own profile'
  ) then
    create policy "Users can view own profile"
    on public.profiles
    for select
    using (auth.uid() = user_id);
  end if;
end $$;

-- Allow admins/gestao/supervisao to view all profiles
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Privileged roles can view all profiles'
  ) then
    create policy "Privileged roles can view all profiles"
    on public.profiles
    for select
    using (
      public.current_user_in_roles(ARRAY['admin'::public.user_role,'gestao'::public.user_role,'supervisao'::public.user_role])
    );
  end if;
end $$;

-- 3) Minimal listing function (no emails exposed)
create or replace function public.list_profiles_minimal()
returns table (
  user_id uuid,
  name text,
  role public.user_role,
  sector text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id, p.name, p.role, p.sector
  from public.profiles p
  order by p.name;
$$;

-- 4) Restrict execution to authenticated users only
revoke all on function public.list_profiles_minimal() from public;
grant execute on function public.list_profiles_minimal() to authenticated;