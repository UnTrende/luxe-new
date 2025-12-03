// Edge function to update loyalty program settings (Admin only)
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';
import { authenticateAdmin } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate admin user
    const admin = await authenticateAdmin(req);
    
    // Parse request body
    const {
      service_rate_silver,
      service_rate_gold,
      service_rate_platinum,
      silver_threshold,
      gold_threshold,
      platinum_threshold,
      late_cancellation_penalty,
      no_show_penalty
    } = await req.json();

    // Build update object with only provided values
    const updateData: any = {};
    
    if (service_rate_silver !== undefined) updateData.service_rate_silver = service_rate_silver;
    if (service_rate_gold !== undefined) updateData.service_rate_gold = service_rate_gold;
    if (service_rate_platinum !== undefined) updateData.service_rate_platinum = service_rate_platinum;
    if (silver_threshold !== undefined) updateData.silver_threshold = silver_threshold;
    if (gold_threshold !== undefined) updateData.gold_threshold = gold_threshold;
    if (platinum_threshold !== undefined) updateData.platinum_threshold = platinum_threshold;
    if (late_cancellation_penalty !== undefined) updateData.late_cancellation_penalty = late_cancellation_penalty;
    if (no_show_penalty !== undefined) updateData.no_show_penalty = no_show_penalty;

    // Update loyalty settings
    const { data, error } = await supabaseAdmin
      .from('loyalty_settings')
      .update(updateData)
      .eq('id', 'default')
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, settings: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});