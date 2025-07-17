export async function getShortageInfo(rxcui) {
    try {
        const baseUrl = `https://labels.fda.gov/api/drug-event.json?search=rxnorm:${rxcui}+AND+shortage:true&limit=1`;
        const proxyUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(baseUrl)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            console.warn(`Shortage API returned status ${response.status}`);
            return "Shortage status unknown";
        }

        const data = await response.json();

        return data.results?.length ? "⚠️ Shortage reported" : "No current shortage";
    } catch (err) {
        console.error("Shortage API error:", err);
        return "Shortage status unknown";
    }
}
