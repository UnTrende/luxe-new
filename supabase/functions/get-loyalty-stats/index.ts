// Edge function to fetch user loyalty statistics
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';
import { authenticateUser } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // Fetch user loyalty stats
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('app_users')
      .select('total_confirmed_visits, redeemable_points, status_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Fetch loyalty settings for reference
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('loyalty_settings')
      .select('*')
      .single();

    if (settingsError) {
      throw settingsError;
    }

    // Calculate progress to next tier
    let progressToNextTier = 0;
    let nextTier = '';
    
    if (userProfile.status_tier === 'Silver') {
      progressToNextTier = Math.min(100, Math.round((userProfile.total_confirmed_visits / settings.silver_threshold) * 100));
      nextTier = 'Gold';
    } else if (userProfile.status_tier === 'Gold') {
      progressToNextTier = Math.min(100, Math.round(((userProfile.total_confirmed_visits - settings.silver_threshold) / (settings.gold_threshold - settings.silver_threshold)) * 100));
      nextTier = 'Platinum';
    } else {
      // Platinum tier - show 100% progress
      progressToNextTier = 100;
      nextTier = 'Max';
    }

    const stats = {
      totalConfirmedVisits: userProfile.total_confirmed_visits,
      redeemablePoints: userProfile.redeemable_points,
      statusTier: userProfile.status_tier,
      progressToNextTier,
      nextTier
    };

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});