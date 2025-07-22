// utils/shortages.js

const BACKEND_BASE = 'https://ndc-compare-backend.onrender.com';

export async function getShortageInfo(drugName, ndc = null) {
    try {
        const url = ndc
            ? `${BACKEND_BASE}/shortage-status?ndc=${encodeURIComponent(ndc)}`
            : `${BACKEND_BASE}/getDpsShortage?name=${encodeURIComponent(drugName)}`;

        const response = await fetch(url);

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error('Invalid JSON response');
        }

        const data = await response.json();

        if (ndc && 'inShortage' in data) {
            if (data.inShortage) {
                const reason = data.reason || 'In shortage';
                return reason;
            }
            return 'Available';
        }

        // Fallback: openFDA or generic name lookup
        return data?.status || 'No data';
    } catch (err) {
        console.warn(`⚠️ Shortage fetch failed for "${drugName || ndc}":`, err.message);
        return 'No data';
    }
}
