// utils/rxnorm.js

const RXNAV_PROXY_BASE = 'https://ndc-compare-backend.onrender.com/proxy/rxnav';

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

function normalizeStrength(strength) {
    if (!strength) return null;
    const match = strength.match(/[\d.]+/g);
    return match ? match.join(" ") : null;
}

// 🔬 Main comparison logic
export async function compareDrugsEquivalency(ndc1, ndc2) {
    try {
        const [res1, res2] = await Promise.all([
            fetch(`https://ndc-compare-backend.onrender.com/query?ndc=${ndc1}`),
            fetch(`https://ndc-compare-backend.onrender.com/query?ndc=${ndc2}`)
        ]);
        const [data1Wrapped, data2Wrapped] = await Promise.all([res1.json(), res2.json()]);

        const data1 = data1Wrapped.result;
        const data2 = data2Wrapped.result;

        if (!data1 || !data2 || !data1.TE_Code || !data2.TE_Code) {
            console.warn("⚠️ One or both drugs missing TE_Code — skipping TE comparison");
        }

        const teMatch = data1.TE_Code === data2.TE_Code;
        const applMatch = data1.Appl_No === data2.Appl_No;

        const strength1 = normalizeStrength(data1.Strength);
        const strength2 = normalizeStrength(data2.Strength);
        const strengthMatch = strength1 === strength2;

        const matchSummary = {
            teMatch,
            applMatch,
            strengthMatch,
            overallMatch: teMatch && applMatch && strengthMatch,
            ndc1: { ndc: ndc1, ...data1, normalizedStrength: strength1 },
            ndc2: { ndc: ndc2, ...data2, normalizedStrength: strength2 }
        };

        console.log("🧪 Equivalency Result:", matchSummary);
        return matchSummary;
    } catch (error) {
        console.error("❌ Error comparing drugs:", error);
        return {
            teMatch: false,
            applMatch: false,
            strengthMatch: false,
            overallMatch: false,
            error: true
        };
    }
}
