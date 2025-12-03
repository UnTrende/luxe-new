// Follow this setup for all your Edge Functions
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';

serve(async (req) => {
    // 1. Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // 2. Authenticate the user
        // This ensures only logged-in users can generate hairstyles, preventing abuse
        await authenticateUser(req);

        // 3. Parse request body
        const { image, prompt } = await req.json();

        if (!image || !prompt) {
            throw new Error('Missing image or prompt');
        }

        // 4. Get API Key from environment variables
        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            console.error('GEMINI_API_KEY not set');
            throw new Error('Server configuration error');
        }

        // 5. Call Gemini API
        // We use the REST API directly to avoid complex dependency management in Deno if the SDK isn't fully compatible or needed
        const model = 'gemini-1.5-flash'; // Or 'gemini-pro-vision' depending on availability
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Construct the payload for Gemini API
        // Note: The image should be passed as base64. 
        // The client sends "data:image/png;base64,..." string, we need to strip the prefix if present
        const base64Image = image.includes('base64,') ? image.split('base64,')[1] : image;

        const payload = {
            contents: [{
                parts: [
                    { text: `Edit the hairstyle in this photo to be ${prompt}. Keep the person's face and background the same.` },
                    {
                        inline_data: {
                            mime_type: "image/jpeg", // Assuming jpeg/png, API is flexible
                            data: base64Image
                        }
                    }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error:', errorText);
            throw new Error(`Gemini API failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the generated image
        // Gemini returns candidates -> content -> parts
        const generatedPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inline_data);

        if (!generatedPart) {
            // Sometimes it might return text if it refused to generate an image
            const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
            if (textPart) {
                throw new Error(`AI refused to generate image: ${textPart.text}`);
            }
            throw new Error('No image generated');
        }

        const generatedImageBase64 = generatedPart.inline_data.data;
        const mimeType = generatedPart.inline_data.mime_type || 'image/png';
        const dataUrl = `data:${mimeType};base64,${generatedImageBase64}`;

        return new Response(JSON.stringify({ image: dataUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in generate-hairstyle:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
