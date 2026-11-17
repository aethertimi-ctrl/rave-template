import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const allowedTicketTypes = new Set(['Regular pass', 'Group of 4', 'Table of 4']);

const isValidEmail = (value: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);

// The site runs on a different origin (GitHub Pages), so the browser sends a CORS
// preflight (OPTIONS) first. Without these headers every RSVP is blocked by the browser.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed.' }, 405);
  }

  // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to Edge Functions automatically.
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    return json({ success: false, message: 'Guest list is unavailable right now.' }, 500);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ success: false, message: 'Request body is invalid.' }, 400);
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const ticketType = String(body.ticket_type ?? '').trim();

  if (name.length < 2 || name.length > 80) {
    return json({ success: false, message: 'Please enter your name.' }, 400);
  }

  if (!isValidEmail(email) || email.length < 5 || email.length > 160) {
    return json({ success: false, message: 'Please enter a valid email address.' }, 400);
  }

  if (!allowedTicketTypes.has(ticketType)) {
    return json({ success: false, message: 'Please choose a valid ticket type.' }, 400);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await supabase.from('irave_rsvps').insert({
    name,
    email,
    ticket_type: ticketType,
  });

  if (error) {
    const errorCode = (error as { code?: string }).code ?? '';
    const message = String(error.message ?? '').toLowerCase();

    if (errorCode === '23505' || message.includes('duplicate') || message.includes('already')) {
      // Returned as 200 so the browser client receives the body (non-2xx hides it behind a generic error).
      return json({
        success: true,
        duplicate: true,
        message: 'You are already on the list. We will send the next drop to your inbox.',
      });
    }

    return json({ success: false, message: 'We could not save that RSVP. Please try again.' }, 500);
  }

  return json({
    success: true,
    message: 'You are on the list. We will send the next drop to your inbox.',
  });
});
