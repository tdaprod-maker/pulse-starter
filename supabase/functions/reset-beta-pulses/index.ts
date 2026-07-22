// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

// Minimal typing for the one table this function touches — there is no
// generated Database types file in this project yet (see `supabase gen
// types typescript`), and pulling the full schema isn't needed here.
type Database = {
  public: {
    Tables: {
      user_tokens: {
        Row: {
          user_email: string;
          tokens_remaining: number;
          tokens_used: number;
          updated_at: string;
        };
        Insert: {
          user_email: string;
          tokens_remaining?: number;
          tokens_used?: number;
          updated_at?: string;
        };
        Update: {
          user_email?: string;
          tokens_remaining?: number;
          tokens_used?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Monthly reset of beta pulse balances.
// Invoked exclusively by the pg_cron job defined in
// supabase/migrations/*_schedule_reset_beta_pulses.sql (server-to-server,
// secret key only — no client-facing "publishable" access).
export default {
  fetch: withSupabase<Database>({ auth: ["secret"] }, async (_req, ctx) => {
    const { data, error } = await ctx.supabaseAdmin
      .from("user_tokens")
      .update({ tokens_remaining: 200, updated_at: new Date().toISOString() })
      .gt("tokens_used", 0)
      .select("user_email");

    if (error) {
      console.error("reset-beta-pulses failed:", error.message);
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log(`reset-beta-pulses: reset ${data?.length ?? 0} user(s)`);
    return Response.json({ success: true, reset_count: data?.length ?? 0 });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reset-beta-pulses' \
    --header 'apiKey: <service_role_or_secret_key>' \
    --header 'Authorization: Bearer <service_role_or_secret_key>'

*/
