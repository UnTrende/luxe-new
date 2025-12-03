// Edge function to check and update user loyalty tier based on visit count
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
    
    // Fetch user's current loyalty status
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('app_users')
      .select('total_confirmed_visits, status_tier')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Fetch loyalty settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('loyalty_settings')
      .select('silver_threshold, gold_threshold, platinum_threshold')
      .single();

    if (settingsError) {
      throw settingsError;
    }

    // Determine if tier should be upgraded
    let newTier = userProfile.status_tier;
    let tierUpgraded = false;
    
    if (userProfile.status_tier === 'Silver' && userProfile.total_confirmed_visits >= settings.gold_threshold) {
      newTier = 'Gold';
      tierUpgraded = true;
    } else if (userProfile.status_tier === 'Gold' && userProfile.total_confirmed_visits >= settings.platinum_threshold) {
      newTier = 'Platinum';
      tierUpgraded = true;
    }

    // Update tier if needed
    if (tierUpgraded) {
      const { error: updateError } = await supabaseAdmin
        .from('app_users')
        .update({ status_tier: newTier })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Record the tier upgrade transaction
      const { error: transactionError } = await supabaseAdmin
        .from('loyalty_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'EARNED',
          points_amount: 0,
          description: `Congratulations! You've been upgraded to ${newTier} status after ${userProfile.total_confirmed_visits} visits.`,
        });

      if (transactionError) {
        throw transactionError;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        currentTier: newTier,
        tierUpgraded,
        visitCount: userProfile.total_confirmed_visits
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});