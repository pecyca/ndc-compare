export async function getShortageInfo(rxcui) {
    try {
        const baseUrl = `https://labels.fda.gov/api/drug-event.json?search=rxnorm:${rxcui}+AND+shortage:true&limit=1`;
        const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(baseUrl)}`;
        const response = await fetch(proxyUrl);
        const text = await response.text();

        const data = JSON.parse(text);
        return data.results?.length ? "⚠️ Shortage reported" : "No current shortage";
    } catch (err) {
        console.error("Shortage API error:", err);
        return "Shortage status unknown";
    }
}
