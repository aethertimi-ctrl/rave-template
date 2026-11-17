import { createClient, FunctionsHttpError, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// If the env vars are missing the site still renders; only the RSVP form is disabled.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export type RsvpSubmission = {
  name: string;
  email: string;
  ticket_type: string;
  website?: string;
};

export type RsvpResult = {
  ok: boolean;
  duplicate?: boolean;
  message?: string;
  error?: string;
};

const GENERIC_ERROR = 'We could not save that RSVP. Please try again.';

export async function submitRsvp(payload: RsvpSubmission): Promise<RsvpResult> {
  if (!supabase) {
    return {
      ok: false,
      error: 'The guest list is not open yet. Call +234 802 315 2346 or +234 706 175 3137 to be added.',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('submit-rsvp', {
      body: payload,
    });

    if (error) {
      // For non-2xx replies supabase-js only says "returned a non-2xx status code";
      // the real message is in the response body, so read it from there.
      if (error instanceof FunctionsHttpError) {
        try {
          const response = error.context as Response;
          const body = await response.json();
          if (body?.duplicate) return { ok: false, duplicate: true };
          if (typeof body?.message === 'string' && response.status < 500) {
            return { ok: false, error: body.message };
          }
        } catch {
          // body was not JSON: fall through to the generic message
        }
      }
      return { ok: false, error: GENERIC_ERROR };
    }

    if (data?.duplicate) return { ok: false, duplicate: true };
    if (data?.success === false) return { ok: false, error: data?.message ?? GENERIC_ERROR };

    return {
      ok: true,
      message: data?.message ?? 'You are on the list. We will send the next drop to your inbox.',
    };
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }
}
