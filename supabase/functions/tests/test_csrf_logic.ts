
import { validateCSRF } from '../_shared/auth.ts';

// Mock Request object
class MockRequest {
    headers: Map<string, string>;
    constructor(headers: Record<string, string>) {
        this.headers = new Map(Object.entries(headers));
    }
}
// Add get method to Map if not present (Deno's Headers object works like Map.get, but standard Request.headers is Headers interface)
// We'll just implement a simple conformant interface
const createRequest = (headersObj: Record<string, string>) => {
    return {
        headers: {
            get: (key: string) => headersObj[key] || headersObj[key.toLowerCase()] || null
        }
    } as unknown as Request;
};

console.log("🧪 Testing CSRF Validation Logic...");

// Test 1: Valid Match
try {
    const req = createRequest({
        'X-CSRF-Token': '12345',
        'Cookie': 'csrf-token=12345; path=/'
    });
    validateCSRF(req);
    console.log("✅ Valid Match: Passed");
} catch (e) {
    console.error("❌ Valid Match: Failed", e);
}

// Test 2: Mismatch
try {
    const req = createRequest({
        'X-CSRF-Token': '12345',
        'Cookie': 'csrf-token=67890; path=/'
    });
    validateCSRF(req);
    console.error("❌ Mismatch: Failed (Should have thrown)");
} catch (e) {
    console.log("✅ Mismatch: Passed (Threw error as expected)");
}

// Test 3: Missing Header
try {
    const req = createRequest({
        'Cookie': 'csrf-token=12345'
    });
    validateCSRF(req);
    console.error("❌ Missing Header: Failed (Should have thrown)");
} catch (e) {
    console.log("✅ Missing Header: Passed (Threw error as expected)");
}

// Test 4: Missing Cookie
try {
    const req = createRequest({
        'X-CSRF-Token': '12345'
    });
    validateCSRF(req);
    console.error("❌ Missing Cookie: Failed (Should have thrown)");
} catch (e) {
    console.log("✅ Missing Cookie: Passed (Threw error as expected)");
}
