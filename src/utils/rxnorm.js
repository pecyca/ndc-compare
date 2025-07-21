// utils/rxnorm.js

const RXNAV_PROXY_BASE = 'https://ndc-compare-backend.onrender.com/proxy/rxnav';
const API_BASE = 'https://ndc-compare-backend.onrender.com';

export async function getRxCui(ndc) {
    const formatted = ndc.padStart(11, '0').replace(/(\d{5})(\d{4})(\d{2})/, '$1-$2-$3');
    try {
        const res = await fetch(`${RXNAV_PROXY_BASE}/ndcproperties.json?id=${formatted}&idtype=NDC`);
        const data = await res.json();
        const rxcui = data?.ndcPropertyList?.ndcProperty?.[0]?.rxcui || null;
        console.log(`🔎 RxCUI for ${formatted}:`, rxcui);
        return rxcui;
    } catch (error) {
        console.error("❌ Error fetching RxCUI:", error);
        return null;
    }
}

export async function getBrandName(rxCui) {
    try {
        const res = await fetch(`${RXNAV_PROXY_BASE}/rxcui/${rxcui}/related.json?tty=BN`);
        const data = await res.json();
        const props = data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties;
        const name = props?.[0]?.name || "Unknown";
        console.log(`🏷️ Brand Name for RxCUI ${rxcui}:`, name);
        return name;
    } catch (error) {
        console.error("❌ Error fetching brand name:", error);
        return "Unknown";
    }
}

export async function getFormFromRxCui(rxCui) {
    try {
        const res = await fetch(`${RXNAV_PROXY_BASE}/rxcui/${rxcui}/properties.json`);
        const data = await res.json();
        const form = data?.properties?.name || "Unknown";
        console.log(`💊 Form for RxCUI ${rxcui}:`, form);
        return form;
    } catch (error) {
        console.error("❌ Error fetching form from RxCUI:", error);
        return "Unknown";
    }
}

// ✅ New backend-driven equivalency logic
export async function compareDrugsEquivalency(ndc1, ndc2) {
    try {
        const res = await fetch(`${API_BASE}/compare-equivalency?ndc1=${encodeURIComponent(ndc1)}&ndc2=${encodeURIComponent(ndc2)}`);
        const data = await res.json();

        if (res.ok && data) {
            console.log("🧪 Backend Equivalency Result:", data);
            return data;
        } else {
            throw new Error(data?.error || 'Unknown error from /compare-equivalency');
        }
    } catch (error) {
        console.error("❌ Error comparing drugs via backend:", error);
        return {
            teMatch: false,
            applMatch: false,
            strengthMatch: false,
            overallMatch: false,
            error: true
        };
    }
}
