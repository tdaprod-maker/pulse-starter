-- Schedule the monthly reset of beta pulse balances.
--
-- Prerequisite (run ONCE in the SQL editor of the target project, NOT committed
-- to git, since it stores real secrets in Vault):
--
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<service_role_or_secret_key>', 'edge_function_secret_key');
--
-- The Edge Function (supabase/functions/reset-beta-pulses) must already be
-- deployed before this job's first run, otherwise net.http_post will just
-- receive a 404 from the functions gateway.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select
  cron.schedule(
    'reset-beta-pulses-monthly',
    '0 0 1 * *', -- midnight on the 1st of every month
    $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/reset-beta-pulses',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'edge_function_secret_key')
      ),
      body := jsonb_build_object('trigger', 'cron', 'scheduled_at', now())
    ) as request_id;
    $$
  );
