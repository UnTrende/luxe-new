
// Simplified validatCSRF logic port for Node.js testing
// We can't import directly from TS file without transpiler, so we replicate logic for unit testing the *algorithm*

function validateCSRF(request) {
    // 1. Get Token from Header
    const headerToken = request.headers.get('X-CSRF-Token');

    // 2. Get Token from Cookie
    const cookieHeader = request.headers.get('Cookie');
    let cookieToken = null;
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const csrfCookie = cookies.find(c => c.startsWith('csrf-token='));
        if (csrfCookie) {
            cookieToken = csrfCookie.split('=')[1];
        }
    }

    // 3. Compare
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        throw new Error('CSRF Validation Failed');
    }
}

// Mock Request
class MockRequest {
    constructor(headers) {
        this._headers = headers;
    }
    get headers() {
        return {
            get: (key) => this._headers[key] || this._headers[key.toLowerCase()] || null
        }
    }
}

console.log("🧪 Testing CSRF Validation Logic (Node.js Port)...");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        passed++;
    } else {
        console.error(`❌ ${message}`);
        failed++;
    }
}

// Test 1: Valid Match
try {
    const req = new MockRequest({
        'X-CSRF-Token': '12345',
        'Cookie': 'csrf-token=12345; path=/'
    });
    validateCSRF(req);
    assert(true, "Valid Match: Passed");
} catch (e) {
    assert(false, `Valid Match: Failed - ${e.message}`);
}

// Test 2: Mismatch
try {
    const req = new MockRequest({
        'X-CSRF-Token': '12345',
        'Cookie': 'csrf-token=67890; path=/'
    });
    validateCSRF(req);
    assert(false, "Mismatch: Failed (Should have thrown)");
} catch (e) {
    assert(true, "Mismatch: Passed (Threw error as expected)");
}

// Test 3: Missing Header
try {
    const req = new MockRequest({
        'Cookie': 'csrf-token=12345'
    });
    validateCSRF(req);
    assert(false, "Missing Header: Failed (Should have thrown)");
} catch (e) {
    assert(true, "Missing Header: Passed (Threw error as expected)");
}

// Test 4: Missing Cookie
try {
    const req = new MockRequest({
        'X-CSRF-Token': '12345'
    });
    validateCSRF(req);
    assert(false, "Missing Cookie: Failed (Should have thrown)");
} catch (e) {
    assert(true, "Missing Cookie: Passed (Threw error as expected)");
}

console.log(`\n🎉 Results: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
