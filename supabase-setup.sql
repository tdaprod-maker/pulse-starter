-- Tabela de configuração de marca
create table if not exists brand_config (
  id uuid default gen_random_uuid() primary key,
  user_email text not null unique,
  brand_name text default 'AGENTE 17',
  logo_url text,
  color_primary text default '#3A5AFF',
  color_secondary text default '#5B8FD4',
  color_accent text default '#FFCA1D',
  font_title text default 'Bebas Neue',
  font_body text default 'Inter',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bucket de storage para mídia
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict do nothing;

-- Policy: usuários autenticados podem fazer upload
create policy "Authenticated users can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media');

-- Policy: imagens são públicas para leitura
create policy "Public read access"
on storage.objects for select
to public
using (bucket_id = 'media');

-- RLS na tabela brand_config
alter table brand_config enable row level security;

create policy "Users can manage own brand config"
on brand_config
for all
to authenticated
using (user_email = auth.jwt() ->> 'email')
with check (user_email = auth.jwt() ->> 'email');
