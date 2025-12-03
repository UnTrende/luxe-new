// FIX: Updated to a stable, versioned Deno types URL to resolve TypeScript errors.
/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateUser } from '../_shared/auth.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Order ID is required.");
    }

    // Fetch the specific order belonging to the user
    const { data: order, error: orderError } = await supabaseAdmin
      .from('product_orders')
      .select(`
        id,
        productId:product_id,
        userId:user_id,
        userName:username,
        quantity,
        status,
        timestamp,
        products (name, imageUrl:imageurl, price)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Security: Ensure user can only fetch their own order
      .single();

    if (orderError) throw orderError;

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    return new Response(JSON.stringify(order), {
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