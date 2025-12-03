// FIX: Updated to a stable, versioned Deno types URL to resolve TypeScript errors.
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user and check for admin role
    const client = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user }, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!user || user.app_metadata.role !== 'admin') {
      throw new Error("Unauthorized: Admin access required.");
    }

    // Get the request data
    const { userId, newRole } = await req.json();

    // Validate role
    if (!['customer', 'barber', 'admin'].includes(newRole)) {
      throw new Error('Invalid role. Must be customer, barber, or admin.');
    }

    // Update user metadata in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: newRole
        }
      }
    );

    if (authError) throw authError;

    // Update user role in app_users table
    const { data: appUser, error: appUserError } = await supabaseAdmin
      .from('app_users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (appUserError) throw appUserError;

    return new Response(JSON.stringify({
      success: true,
      message: `User role updated to ${newRole}`,
      user: appUser
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});