// utils/rxnorm.js

const RXNAV_PROXY_BASE = 'https://ndc-compare-backend.onrender.com/proxy/rxnav';
const BACKEND_BASE = 'https://ndc-compare-backend.onrender.com';

// 🔍 Get RxCUI from NDC
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

// 🏷️ Get Brand Name from RxCUI
export async function getBrandName(rxCui) {
    try {
        const res = await fetch(`${RXNAV_PROXY_BASE}/rxcui/${rxCui}/related.json?tty=BN`);
        const data = await res.json();
        const props = data?.relatedGroup?.conceptGroup?.[0]?.conceptProperties;
        const name = props?.[0]?.name || "Unknown";
        console.log(`🏷️ Brand Name for RxCUI ${rxCui}:`, name);
        return name;
    } catch (error) {
        console.error("❌ Error fetching brand name:", error);
        return "Unknown";
    }
}

// 💊 Get Form Name from RxCUI
export async function getFormFromRxCui(rxCui) {
    try {
        const res = await fetch(`${RXNAV_PROXY_BASE}/rxcui/${rxCui}/properties.json`);
        const data = await res.json();
        const form = data?.properties?.name || "Unknown";
        console.log(`💊 Form for RxCUI ${rxCui}:`, form);
        return form;
    } catch (error) {
        console.error("❌ Error fetching form from RxCUI:", error);
        return "Unknown";
    }
}

// Normalize strength string (keep only digits and periods)
function normalizeStrength(strength) {
    if (!strength) return null;
    const match = strength.match(/[\d.]+/g);
    return match ? match.join(" ") : null;
}

// 🧪 Compare 2 NDCs via backend SQLite
export async function compareDrugsEquivalency(ndc1, ndc2) {
    try {
        const [res1, res2] = await Promise.all([
            fetch(`${BACKEND_BASE}/query?ndc=${ndc1}`),
            fetch(`${BACKEND_BASE}/query?ndc=${ndc2}`)
        ]);
        const [data1Wrapped, data2Wrapped] = await Promise.all([res1.json(), res2.json()]);

        const data1 = data1Wrapped?.result;
        const data2 = data2Wrapped?.result;

        if (!data1 || !data2) {
            console.warn("⚠️ One or both NDCs not found in backend database.");
            return {
                teMatch: false,
                applMatch: false,
                strengthMatch: false,
                overallMatch: false,
                reason: "One or both entries are missing",
                entry1: data1 || null,
                entry2: data2 || null,
            };
        }

        const teMatch = data1.TE_Code === data2.TE_Code;
        const applMatch = data1.Appl_No === data2.Appl_No;
        const strengthMatch = normalizeStrength(data1.Strength) === normalizeStrength(data2.Strength);

        const matchResult = {
            teMatch,
            applMatch,
            strengthMatch,
            overallMatch: teMatch && applMatch && strengthMatch,
            ndc1: { ndc: ndc1, ...data1 },
            ndc2: { ndc: ndc2, ...data2 }
        };

        console.log("🧪 Match Summary:", matchResult);
        return matchResult;
    } catch (error) {
        console.error("❌ Error comparing drugs via backend:", error);
        return {
            teMatch: false,
            applMatch: false,
            strengthMatch: false,
            overallMatch: false,
            reason: "Error during backend call",
            error: error.message
        };
    }
}
