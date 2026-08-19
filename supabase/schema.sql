-- gymhere · schema Supabase (PostgreSQL)
-- A executer dans l'éditeur SQL de ton projet Supabase (Database > SQL editor).
-- Reflète le modèle de données de HANDOFF.md section 9.

create extension if not exists "uuid-ossp";

-- ========== USERS (profil applicatif, lié à auth.users) ==========
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  phone text,
  avatar_url text,
  city text not null default 'Lyon',
  roles text[] not null default array['member'],
  created_at timestamptz not null default now()
);

-- ========== GYMS ==========
create table if not exists public.gyms (
  id text primary key,
  name text not null,
  address text not null,
  quartier text not null,
  lat double precision not null,
  lng double precision not null,
  photos text[] not null default '{}',
  certified boolean not null default false,
  sponsored boolean not null default false,
  hours text,
  hours_sub text,
  price_min integer not null default 0,
  rating numeric(2,1) not null default 0,
  reviews_count integer not null default 0,
  services jsonb not null default '[]', -- [{name, icon, tint, color}]
  formulas jsonb not null default '[]', -- [{name, sub, price, highlight}]
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ========== GYM EQUIPMENT (la signature gymhere) ==========
create table if not exists public.gym_equipment (
  id uuid primary key default uuid_generate_v4(),
  gym_id text not null references public.gyms(id) on delete cascade,
  groupe_musculaire text not null,
  nom_machine text not null,
  marque text not null default '–',
  quantite integer not null default 1
);
create index if not exists gym_equipment_gym_id_idx on public.gym_equipment(gym_id);

-- ========== COACHES ==========
create table if not exists public.coaches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  bio text not null default '',
  specialites text[] not null default '{}', -- max 3, enforced app-side
  zone text not null default '',
  photo_url text,
  published boolean not null default false,
  completion integer not null default 0,
  socials jsonb not null default '{}', -- {instagram,tiktok,youtube,linkedin}
  gym_ids text[] not null default '{}',
  rating numeric(2,1) not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.coach_credentials (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  type text not null check (type in ('diplome','certif')),
  label text not null,
  verified boolean not null default false
);

create table if not exists public.coach_formulas (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  nom text not null,
  mode text not null check (mode in ('presentiel','visio','en_ligne')),
  duree text,
  prix text not null,
  per text,
  description text,
  recommande boolean not null default false
);

create table if not exists public.coach_availability (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  service text not null check (service in ('presentiel','visio','telephone')),
  jour text not null check (jour in ('Lun','Mar','Mer','Jeu','Ven','Sam','Dim')),
  heure_debut time not null,
  heure_fin time not null
);
create index if not exists coach_availability_coach_id_idx on public.coach_availability(coach_id);

-- ========== BOOKINGS (demandes) ==========
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('gym','coach')),
  target_id text not null,
  kind text not null check (kind in ('essai','inscription','contact','appel','formule')),
  mode text not null check (mode in ('slot','request')),
  date date,
  slot text,
  message text default '',
  statut text not null default 'en_attente' check (statut in ('en_attente','confirme','accepte','refuse')),
  created_at timestamptz not null default now()
);
create index if not exists bookings_user_id_idx on public.bookings(user_id);

-- ========== REVIEWS ==========
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('gym','coach')),
  target_id text not null,
  booking_id uuid not null references public.bookings(id) on delete cascade unique,
  note integer not null check (note between 1 and 5),
  criteres jsonb not null default '{}',
  tags text[] not null default '{}',
  commentaire text default '',
  created_at timestamptz not null default now()
);

-- ========== REPORTS (signalement d'une fiche salle/coach) ==========
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('gym','coach')),
  target_id text not null,
  reason text not null check (reason in ('horaires','tarifs','coordonnees','indisponible','autre')),
  message text default '',
  created_at timestamptz not null default now()
);
create index if not exists reports_target_idx on public.reports(target_type, target_id);

-- ========== MESSAGES ==========
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id text not null,
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  texte text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_id_idx on public.messages(thread_id);

-- ========== NOTIFICATIONS ==========
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  titre text not null,
  corps text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

-- ========== SUBSCRIPTIONS (coach, V1.1 Stripe) ==========
create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  plan text not null check (plan in ('mensuel','annuel')),
  statut text not null default 'inactif',
  stripe_id text,
  periode_debut timestamptz,
  periode_fin timestamptz
);

-- ========== FAVORITES ==========
create table if not exists public.favorites (
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('gym','coach')),
  target_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

-- ========== WAITLIST (villes hors zone) ==========
create table if not exists public.waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  ville text not null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Règle d'or : exploration (gyms, coaches, avis) publique et gratuite.
-- Écriture réservée à l'utilisateur propriétaire de la ligne.
-- =====================================================================

alter table public.users enable row level security;
alter table public.gyms enable row level security;
alter table public.gym_equipment enable row level security;
alter table public.coaches enable row level security;
alter table public.coach_credentials enable row level security;
alter table public.coach_formulas enable row level security;
alter table public.coach_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.favorites enable row level security;
alter table public.waitlist enable row level security;

-- Lecture publique (exploration sans compte) sur le contenu des salles/coachs
create policy "gyms are public" on public.gyms for select using (true);
create policy "gym_equipment is public" on public.gym_equipment for select using (true);
create policy "coaches are public" on public.coaches for select using (published = true);
create policy "coach_credentials are public" on public.coach_credentials for select using (true);
create policy "coach_formulas are public" on public.coach_formulas for select using (true);
create policy "coach_availability is public" on public.coach_availability for select using (true);
create policy "reviews are public" on public.reviews for select using (true);

-- Users : chacun ne voit / modifie que son propre profil
create policy "users select own" on public.users for select using (auth.uid() = id);
create policy "users update own" on public.users for update using (auth.uid() = id);
create policy "users insert own" on public.users for insert with check (auth.uid() = id);

-- Coaches : le propriétaire (user_id) gère sa fiche
create policy "coach owner all" on public.coaches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "coach owner sees own even unpublished" on public.coaches for select using (auth.uid() = user_id);
create policy "coach_credentials owner write" on public.coach_credentials for insert with check (
  exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));
create policy "coach_credentials owner delete" on public.coach_credentials for delete using (
  exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));
create policy "coach_formulas owner write" on public.coach_formulas for all using (
  exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));
create policy "coach_availability owner write" on public.coach_availability for all using (
  exists (select 1 from public.coaches c where c.id = coach_id and c.user_id = auth.uid()));

-- Bookings : l'utilisateur voit/crée ses propres demandes ; le coach/la salle ciblé(e) peut lire
create policy "bookings owner all" on public.bookings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reviews : l'auteur peut créer/lire les siens (au delà de la lecture publique déjà ouverte)
create policy "reviews owner insert" on public.reviews for insert with check (auth.uid() = user_id);

-- Reports : l'auteur peut créer/lire les siens ; pas de lecture publique
-- (une vraie relecture admin viendra avec le passage hors mode démo, cf. feuille de route)
create policy "reports owner all" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Messages : uniquement les deux participants du thread
create policy "messages participants" on public.messages for all using (auth.uid() = from_user or auth.uid() = to_user);

-- Notifications : propriétaire uniquement
create policy "notifications owner all" on public.notifications for all using (auth.uid() = user_id);

-- Favorites : propriétaire uniquement
create policy "favorites owner all" on public.favorites for all using (auth.uid() = user_id);

-- Waitlist : insertion publique (capture d'email hors zone), pas de lecture publique
create policy "waitlist public insert" on public.waitlist for insert with check (true);
