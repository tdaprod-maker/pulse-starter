-- Aquisição via Stripe: rastreia se já enviamos o email de acesso (link pra
-- definir senha) pro cliente que pagou via Checkout sem ter conta prévia.
-- Belt-and-suspenders sobre a dedupe de stripe_events — garante que retries do
-- Stripe não reenviem o email mesmo se o evento for reprocessado.
alter table public.user_tokens
  add column if not exists access_email_sent_at timestamptz;
