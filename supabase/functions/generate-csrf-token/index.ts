
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Generate a secure random token
        const csrfToken = crypto.randomUUID();

        // Create response with the token in body
        const response = new Response(JSON.stringify({ csrfToken }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

        // Set the cookie
        // Note: In production with a custom domain, you'd want Secure; SameSite=Strict.
        // For local dev and Supabase default domains, SameSite=Lax is safer to avoid blocking cross-site redirects if any.
        // We'll use SameSite=Lax to allow top-level sorts of navigations if that ever happens, but Strict is better for CSRF.
        // Given the request "Double Submit Cookie", we need to set a cookie that the JS can read?
        // STRICTLY SPEAKING: Double Submit Cookie requires the cookie to be readable by JS *OR* the frontend generates it.
        // IF the backend generates it, it can be an HTTPOnly cookie (Cookie-to-Header pattern) OR a JS-readable cookie.
        // The "stateless" double submit usually implies the cookie is readable by JS so JS can put it in the header.
        // OR the backend sends it in the Body AND a HttpOnly Cookie. The JS reads the Body and puts it in the Header.
        // Let's go with: Backend sends in Body AND sets a Cookie.
        // To allow `auth.ts` to validate, it needs to read the cookie.
        // `Deno` edge functions can read cookies.

        // Cookie attributes:
        // HttpOnly: False (if we want JS to read it directly? No, we sent it in the body). 
        // Secure: True (Supabase functions are HTTPS).
        // SameSite: Lax (or Strict).

        // Actually, for Double Submit, we can just set it as a cookie.
        // If we want valid double submit, the incoming request must have:
        // 1. Cookie 'csrf-token'
        // 2. Header 'X-CSRF-Token'
        // And they must match.

        // We will set the cookie here.
        const cookieName = 'csrf-token';
        const cookieValue = csrfToken;
        const maxAge = 60 * 60 * 24; // 24 hours

        // Construct Set-Cookie header manually as Deno std/http/cookie might need import
        // Format: name=value; Path=/; Max-Age=...; Secure; SameSite=Lax
        const cookieString = `${cookieName}=${cookieValue}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax`;

        response.headers.set('Set-Cookie', cookieString);

        return response;

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
