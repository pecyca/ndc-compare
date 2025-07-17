// src/utils/shortages.js

function encodeUrl(url) {
    return encodeURIComponent(url);
}

export async function getShortageInfo(rxcui) {
    try {
        const targetUrl = encodeUrl(`https://labels.fda.gov/api/drug-event.json?search=rxnorm:${rxcui}+AND+shortage:true&limit=1`);
        const url = `/.netlify/functions/proxy?url=${targetUrl}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.results && data.results.length > 0 ? "⚠️ Shortage reported" : "No current shortage";
    } catch (error) {
        console.error("Shortage API error:", error);
        return "Shortage status unknown";
    }
}
