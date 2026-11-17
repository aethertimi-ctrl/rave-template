import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const allowedTicketTypes = new Set(['Regular pass', 'Group of 4', 'Table of 4']);
const isValidEmail = (value: string): boolean => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Guest list is unavailable right now.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed.' }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: 'Request body is invalid.' }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const ticketType = String(body.ticket_type ?? '').trim();

  if (name.length < 2 || name.length > 80) {
    return new Response(
      JSON.stringify({ success: false, message: 'Please enter your name.' }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!isValidEmail(email) || email.length < 5 || email.length > 160) {
    return new Response(
      JSON.stringify({ success: false, message: 'Please enter a valid email address.' }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!allowedTicketTypes.has(ticketType)) {
    return new Response(
      JSON.stringify({ success: false, message: 'Please choose a valid ticket type.' }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
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
      return new Response(
        JSON.stringify({
          success: false,
          duplicate: true,
          message: 'You are already on the list. We will send the next drop to your inbox.',
        }),
        {
          status: 409,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'We could not save that RSVP. Please try again.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'You are on the list. We will send the next drop to your inbox.',
    }),
    {
      headers: corsHeaders,
    }
  );
});
