-- 0001_init.sql — baseline schema for a gm-template app.
-- Numbered, append-only. Take the next free number AFTER the highest on origin/main.
-- Every table gets RLS. The service-role key (server only) bypasses RLS; the SPA's
-- anon key is always RLS-scoped. See docs/architecture-patterns.md.

-- profiles — the app-layer identity the Hono auth middleware reads (server/index.ts
-- authMiddleware: getClaims() → profiles(id, role, name)). One row per Supabase auth user.
create table if not exists public.profiles (
    id          uuid primary key references auth.users (id) on delete cascade,
    email       text,
    name        text,
    role        text not null default 'member',   -- 'owner' | 'admin' | 'member' (isAdmin = owner/admin)
    created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read/update their own profile. Role changes are a service-role (server) op.
create policy profiles_self_select on public.profiles
    for select using (auth.uid() = id);
create policy profiles_self_update on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- New auth user → profile row (keeps the identity table in lockstep with auth.users).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into public.profiles (id, email, name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Example resource table — replace with your domain. Shows the RLS shape every table follows.
create table if not exists public.items (
    id          uuid primary key default gen_random_uuid(),
    owner_id    uuid not null references auth.users (id) on delete cascade,
    title       text not null,
    created_at  timestamptz not null default now()
);

alter table public.items enable row level security;

create policy items_owner_all on public.items
    for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
