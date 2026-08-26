-- Guarda a foto de perfil da conta conectada (Instagram/LinkedIn) para exibir
-- "Conectado como @username" com avatar no Brand Kit, sem precisar rechamar a API
-- da rede social a cada carregamento da página.
alter table public.social_connections
  add column if not exists platform_avatar_url text;
