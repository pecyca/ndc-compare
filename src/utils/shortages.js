export async function getShortageInfo(rxcui) {
    try {
        const response = await fetch(`https://api.fda.gov/drug/shortages.json?search=rxcui:${rxcui}`);
        const data = await response.json();

        if (data?.results?.length > 0) {
            const status = data.results[0]?.status || "Shortage status unknown";
            return `🚨 FDA Shortage Alert: ${status}`;
        } else {
            return "✅ No reported FDA shortages";
        }
    } catch (e) {
        console.warn("Shortage info fetch failed:", e);
        return "⚠️ Unable to retrieve shortage info";
    }
}
