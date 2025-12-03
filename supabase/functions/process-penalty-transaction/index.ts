// Edge function to process penalty transactions for late cancellations and no-shows
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
    const { userId, penaltyType, bookingId, reason } = await req.json();

    if (!userId || !penaltyType) {
      throw new Error('Missing required parameters: userId and penaltyType');
    }

    // Validate penalty type
    if (penaltyType !== 'late_cancellation' && penaltyType !== 'no_show') {
      throw new Error('Invalid penalty type. Must be either "late_cancellation" or "no_show"');
    }

    // Fetch user's current loyalty status
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('app_users')
      .select('redeemable_points')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Fetch loyalty settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('loyalty_settings')
      .select('late_cancellation_penalty, no_show_penalty')
      .single();

    if (settingsError) {
      throw settingsError;
    }

    // Determine penalty points
    const penaltyPoints = penaltyType === 'late_cancellation' 
      ? settings.late_cancellation_penalty 
      : settings.no_show_penalty;

    // Calculate new point balance (cannot go below 0)
    const newPointBalance = Math.max(0, userProfile.redeemable_points - penaltyPoints);

    // Update user's point balance
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('app_users')
      .update({
        redeemable_points: newPointBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Record the penalty transaction
    const { error: transactionError } = await supabaseAdmin
      .from('loyalty_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'PENALTY',
        points_amount: -penaltyPoints,
        description: `${penaltyType.replace('_', ' ')} penalty (${reason || 'Booking violation'})`,
        booking_id: bookingId
      });

    if (transactionError) {
      throw transactionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        penaltyApplied: penaltyPoints,
        newPointBalance,
        penaltyType
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