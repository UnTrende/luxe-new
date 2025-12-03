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
    const { bookingDetails } = await req.json();

    // Authenticate user if possible
    let userId = null;
    try {
      const user = await authenticateUser(req);
      userId = user.id;
    } catch (authError) {
      // User is not authenticated, which is allowed for guest bookings
      console.log('User not authenticated, allowing guest booking');
    }

    // Map JavaScript property names to database column names (all lowercase)
    const newBookingData = {
      user_id: bookingDetails.userId || userId,
      username: bookingDetails.userName,  // Try lowercase
      barber_id: bookingDetails.barberId,
      service_ids: bookingDetails.serviceIds,
      date: bookingDetails.date,
      timeslot: bookingDetails.timeSlot,  // This works based on get-booked-slots
      totalprice: bookingDetails.totalPrice,  // Try lowercase
      status: 'confirmed',  // FIXED: lowercase to match database constraint
      reviewleft: false  // Try lowercase
    };

    // Insert booking
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(newBookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Process loyalty transaction for each service
    if (userId && bookingDetails.serviceIds && bookingDetails.serviceIds.length > 0) {
      try {
        // Process loyalty for the first service (assuming single service bookings for simplicity)
        // In a real implementation, you might want to process loyalty for all services
        const serviceId = bookingDetails.serviceIds[0];
        
        // Call the process-loyalty-transaction function
        const { data: loyaltyResult, error: loyaltyError } = await supabaseAdmin.functions.invoke(
          'process-loyalty-transaction',
          {
            body: {
              bookingId: newBooking.id,
              amountPaid: bookingDetails.totalPrice,
              serviceId: serviceId
            }
          }
        );

        if (loyaltyError) {
          console.error('Loyalty transaction failed:', loyaltyError.message);
        } else {
          console.log('Loyalty transaction successful:', loyaltyResult);
        }
      } catch (loyaltyProcessingError) {
        console.error('Error processing loyalty transaction:', loyaltyProcessingError);
      }
    }

    // Create notification for barber
    // Fetch Barber Name and User ID for the notification message
    const { data: barberData } = await supabaseAdmin
      .from('barbers')
      .select('name, user_id')
      .eq('id', newBooking.barber_id)
      .single();

    const barberName = barberData?.name || 'the barber';
    const barberUserId = barberData?.user_id || newBooking.barber_id; // Fallback to barber_id if user_id not found

    // Prepare Notifications
    const notifications: any[] = [];

    // 1. Notify the Barber (using user_id, not barber_id)
    notifications.push({
      recipient_id: barberUserId,
      type: 'BOOKING_CONFIRMED',
      message: `${newBooking.username} booked an appointment for ${newBooking.date} at ${newBooking.timeslot}.`,
      payload: { bookingId: newBooking.id }
    });

    // 2. Notify Admins
    const { data: admins } = await supabaseAdmin
      .from('app_users')
      .select('id')
      .eq('role', 'admin');

    if (admins && admins.length > 0) {
      admins.forEach(admin => {
        // Prevent duplicate if barber is admin
        if (admin.id !== newBooking.barber_id) {
          notifications.push({
            recipient_id: admin.id,
            type: 'BOOKING_CONFIRMED',
            message: `New Booking: ${newBooking.username} booked ${barberName} for ${newBooking.date} at ${newBooking.timeslot}.`,
            payload: { bookingId: newBooking.id }
          });
        }
      });
    } else {
      // Fallback: If no admins in app_users, try to notify the booking creator if they are admin? No.
      console.log("No admins found in app_users table to notify.");
    }

    // Insert all notifications
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert(notifications);

    if (notificationError) console.error("Failed to create notifications:", notificationError.message);


    return new Response(JSON.stringify({
      ...newBooking,
      debug: {
        notificationsSent: notifications.length,
        adminsFound: admins ? admins.length : 0,
        adminIds: admins ? admins.map(a => a.id) : [],
        barberId: newBooking.barber_id,
        notificationError: notificationError // Return error if any
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});