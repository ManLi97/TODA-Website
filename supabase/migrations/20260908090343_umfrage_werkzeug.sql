-- OWNER: toda-website
-- Umfrage-Werkzeug: Umfragen, persönliche Teilnehmer-Links, Antworten (JSON).
-- RLS an, bewusst KEINE Policies — Schreib-/Lesezugriff ausschließlich per Service-Role (Route Handler, Scripts).

create table public.surveys (
  slug        text primary key check (slug ~ '^[a-z0-9-]{3,40}$'),
  title       text not null check (char_length(title) between 1 and 120),
  closes_at   timestamptz not null,
  created_at  timestamptz not null default now()
);

create table public.survey_participants (
  id           uuid primary key default gen_random_uuid(),
  survey_slug  text not null references public.surveys(slug) on delete cascade,
  token        text not null unique check (token ~ '^[A-Za-z0-9]{12}$'),
  label        text not null check (char_length(label) between 1 and 80),
  created_at   timestamptz not null default now(),
  unique (survey_slug, label)
);
create index survey_participants_survey_slug_idx on public.survey_participants (survey_slug);

create table public.survey_responses (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null unique references public.survey_participants(id) on delete cascade,
  survey_slug     text not null references public.surveys(slug) on delete cascade,
  display_name    text check (display_name is null or char_length(display_name) <= 80),
  answers         jsonb not null check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 16384),
  user_agent      text check (user_agent is null or char_length(user_agent) <= 400),
  submitted_at    timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index survey_responses_survey_slug_idx on public.survey_responses (survey_slug);

alter table public.surveys             enable row level security;
alter table public.survey_participants enable row level security;
alter table public.survey_responses    enable row level security;
revoke all on public.surveys, public.survey_participants, public.survey_responses from anon, authenticated;
