import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabaseClient.ts';
import { authenticateAdmin } from '../_shared/auth.ts';

const jsonToCsv = (items: any[]) => {
    if (!items || items.length === 0) return '';
    const replacer = (_key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(items[0]);
    const csv = [
        header.join(','), // header row
        ...items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    return csv;
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        await authenticateAdmin(req);
        const { entity, format } = await req.json();

        if (format !== 'csv') {
            throw new Error('Only CSV export is currently supported by the backend.');
        }

        let data: any[] = [];
        let filename = 'export.csv';

        if (entity === 'bookings') {
            // Get all bookings first
            const { data: bookings, error: bookingsError } = await supabaseAdmin
                .from('bookings')
                .select('*');
            
            if (bookingsError) throw bookingsError;
            
            // Process bookings to include readable names by fetching related data
            const processedBookings = await Promise.all(bookings.map(async (booking) => {
                // Get user name from app_users table using the user_id
                let userName = booking.userName || 'N/A';
                if (booking.user_id) {
                    const { data: userData, error: userError } = await supabaseAdmin
                        .from('app_users')
                        .select('name')
                        .eq('id', booking.user_id)
                        .single();
                    
                    if (!userError && userData) {
                        userName = userData.name;
                    }
                }
                
                // Get barber name from barbers table using the barber_id
                let barberName = 'N/A';
                if (booking.barber_id) {
                    const { data: barberData, error: barberError } = await supabaseAdmin
                        .from('barbers')
                        .select('name')
                        .eq('id', booking.barber_id)
                        .single();
                    
                    if (!barberError && barberData) {
                        barberName = barberData.name;
                    }
                }
                
                // Get service names from services table using service_ids
                let serviceNames: string[] = [];
                if (booking.service_ids && booking.service_ids.length > 0) {
                    const { data: services, error: servicesError } = await supabaseAdmin
                        .from('services')
                        .select('name')
                        .in('id', booking.service_ids);
                    
                    if (!servicesError && services) {
                        serviceNames = services.map(s => s.name);
                    }
                }
                
                // Return enhanced booking with names instead of just IDs
                return {
                    ...booking,
                    user_name: userName,
                    barber_name: barberName,
                    service_names: serviceNames.join('; ')
                };
            }));
            
            data = processedBookings || [];
            filename = 'bookings_export.csv';
        } else if (entity === 'orders') {
            // Get all orders first
            const { data: orders, error: ordersError } = await supabaseAdmin
                .from('product_orders')
                .select('*');
            
            if (ordersError) throw ordersError;
            
            // Process orders to include readable names
            const processedOrders = await Promise.all(orders.map(async (order) => {
                // Get user name from app_users table using the user_id
                let userName = order.userName || 'N/A';
                if (order.user_id) {
                    const { data: userData, error: userError } = await supabaseAdmin
                        .from('app_users')
                        .select('name')
                        .eq('id', order.user_id)
                        .single();
                    
                    if (!userError && userData) {
                        userName = userData.name;
                    }
                } else if (order.username) {
                    // Fallback to username field if user_id is not available
                    userName = order.username;
                }
                
                // Get product name from products table using the product_id
                let productName = 'N/A';
                if (order.product_id) {
                    const { data: productData, error: productError } = await supabaseAdmin
                        .from('products')
                        .select('name')
                        .eq('id', order.product_id)
                        .single();
                    
                    if (!productError && productData) {
                        productName = productData.name;
                    }
                }
                
                // Return enhanced order with names instead of just IDs
                return {
                    ...order,
                    user_name: userName,
                    product_name: productName
                };
            }));
            
            data = processedOrders || [];
            filename = 'orders_export.csv';
        } else if (entity === 'users') {
            const { data: users, error } = await supabaseAdmin.from('app_users').select('*');
            if (error) throw error;
            
            data = users || [];
            filename = 'users_export.csv';
        }

        const csvContent = jsonToCsv(data);

        return new Response(JSON.stringify({
            csv: csvContent,
            filename
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