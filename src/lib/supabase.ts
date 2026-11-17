import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// If the env vars are missing the site still renders; only the RSVP form is disabled.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export type RsvpSubmission = {
  name: string;
  email: string;
  ticket_type: string;
};

export async function submitRsvp(payload: RsvpSubmission): Promise<{
  ok: boolean;
  duplicate?: boolean;
  message?: string;
  error?: string;
}> {
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
      const message = error.message?.toLowerCase() ?? '';
      if (message.includes('duplicate') || message.includes('already')) {
        return {
          ok: false,
          duplicate: true,
          error: 'You are already on the list. We will send the next drop to your inbox.',
        };
      }

      return {
        ok: false,
        error: 'We could not save that RSVP. Please try again.',
      };
    }

    return {
      ok: true,
      message: data?.message ?? 'You are on the list. We will send the next drop to your inbox.',
    };
  } catch {
    return {
      ok: false,
      error: 'We could not save that RSVP. Please try again.',
    };
  }
}
