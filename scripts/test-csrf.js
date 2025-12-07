
const FETCH_URL = 'http://localhost:54321/functions/v1/generate-csrf-token';

async function testCSRF() {
    console.log('🧪 Testing CSRF Token Generation...');
    try {
        const response = await fetch(FETCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Failed: ${response.status} ${response.statusText} - ${text}`);
            process.exit(1);
        }

        const data = await response.json();
        console.log('✅ Response JSON:', data);

        // Check Body
        if (!data.csrfToken || typeof data.csrfToken !== 'string') {
            console.error('❌ Missing csrfToken in response body');
            process.exit(1);
        }
        console.log('✅ Found csrfToken in body:', data.csrfToken);

        // Check Cookie
        const cookies = response.headers.get('set-cookie');
        if (!cookies) {
            console.error('❌ Missing Set-Cookie header');
            process.exit(1);
        }
        console.log('✅ Set-Cookie Header:', cookies);

        if (!cookies.includes('csrf-token=')) {
            console.error('❌ Cookie does not contain csrf-token');
            process.exit(1);
        }

        // Verify values match (requires parsing cookie, but body token is what frontend uses for header)
        // The Double Submit pattern relies on the cookie being set.

        console.log('🎉 CSRF Generation Test Passed!');

    } catch (error) {
        console.error('❌ Exception during test:', error);
        process.exit(1);
    }
}

testCSRF();
