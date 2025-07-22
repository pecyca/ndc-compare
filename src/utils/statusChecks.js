// utils/statusChecks.js

const BACKEND_BASE = 'https://ndc-compare-backend.onrender.com';

export async function checkDiscontinuedStatus(ndc) {
    try {
        const response = await fetch(`${BACKEND_BASE}/discontinued-status?ndc=${encodeURIComponent(ndc)}`);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Invalid JSON response');
        }

        const data = await response.json();
        return data.discontinued || false;
    } catch (error) {
        console.error("❌ Discontinued status check failed:", error.message);
        return false;
    }
}

export async function checkShortageStatus(ndc) {
    try {
        const response = await fetch(`${BACKEND_BASE}/shortage-status?ndc=${encodeURIComponent(ndc)}`);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Invalid JSON response');
        }

        const data = await response.json();
        return data.inShortage || false;
    } catch (error) {
        console.error("❌ Shortage status check failed:", error.message);
        return false;
    }
}
