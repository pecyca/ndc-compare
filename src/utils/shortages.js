// src/utils/shortages.js

export async function getShortageInfo(rxcui) {
    try {
        const baseUrl = `https://labels.fda.gov/api/drug-event.json?search=rxnorm:${rxcui}+AND+shortage:true&limit=1`;
        const proxyUrl = `/netlify/functions/proxy?url=${encodeURIComponent(baseUrl)}`;
        const response = await fetch(proxyUrl);
        const contentType = response.headers.get("content-type") || "";

        const isJson = contentType.includes("application/json");
        const text = await response.text();

        if (!response.ok || !isJson || !text.trim().startsWith("{")) {
            console.warn(`FDA Shortage response not valid JSON: ${text.slice(0, 120)}`);
            return "Shortage status unknown";
        }

        const data = JSON.parse(text);
        const hasShortage = Array.isArray(data.results) && data.results.length > 0;

        return hasShortage ? "⚠️ Shortage reported" : "No current shortage";
    } catch (err) {
        console.error("Error fetching shortage info:", err);
        return "Shortage status unknown";
    }
}
