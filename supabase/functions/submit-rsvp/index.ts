import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const allowedTicketTypes = new Set(['Regular pass', 'Group of 4', 'Table of 4']);
const isValidEmail = (value: string): boolean => /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(value);
const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 60 * 60;

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin');
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

const json = (req: Request, body: Record<string, unknown>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return json(req, { success: false, message: 'Method not allowed.' }, 405);
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) {
    return json(req, { success: false, message: 'Guest list is unavailable right now.' }, 500);
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(req, { success: false, message: 'Request is too large.' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json(req, { success: false, message: 'Request is too large.' }, 413);
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return json(req, { success: false, message: 'Request body is invalid.' }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json(req, { success: false, message: 'Request body is invalid.' }, 400);
  }

  // A filled honeypot is silently accepted, but never written to the RSVP table.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return json(req, {
      success: true,
      message: 'You are on the list. We will send the next drop to your inbox.',
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const ticketType = typeof body.ticket_type === 'string' ? body.ticket_type.trim() : '';

  if (name.length < 2 || name.length > 80) {
    return json(req, { success: false, message: 'Please enter your name.' }, 400);
  }
  if (!isValidEmail(email) || email.length < 5 || email.length > 160) {
    return json(req, { success: false, message: 'Please enter a valid email address.' }, 400);
  }
  if (!allowedTicketTypes.has(ticketType)) {
    return json(req, { success: false, message: 'Please choose a valid ticket type.' }, 400);
  }

  const clientIp =
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!clientIp) {
    return json(req, { success: false, message: 'Guest list is temporarily unavailable.' }, 503);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Hash the proxy-provided client IP with a server-only pepper; raw IPs are not persisted.
  const rateKey = await sha256(`${Deno.env.get('RSVP_RATE_LIMIT_SALT') ?? serviceRoleKey}:${clientIp}`);
  const { data: allowed, error: rateLimitError } = await supabase.rpc('consume_irave_rsvp_rate_limit', {
    p_rate_key: rateKey,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_WINDOW_SECONDS,
  });
  if (rateLimitError || allowed !== true) {
    return json(req, {
      success: false,
      message: rateLimitError
        ? 'Guest list is temporarily unavailable. Please try again shortly.'
        : 'Too many attempts. Please try again in about an hour.',
    }, rateLimitError ? 503 : 429);
  }

  const { error } = await supabase.from('irave_rsvps').insert({
    name,
    email,
    ticket_type: ticketType,
  });

  if (error) {
    const errorCode = (error as { code?: string }).code ?? '';
    if (errorCode === '23505') {
      return json(req, {
        success: true,
        duplicate: true,
        message: 'You are already on the list. We will send the next drop to your inbox.',
      });
    }
    return json(req, { success: false, message: 'We could not save that RSVP. Please try again.' }, 500);
  }

  return json(req, {
    success: true,
    message: 'You are on the list. We will send the next drop to your inbox.',
  });
});
