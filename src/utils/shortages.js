export async function getShortageInfo(drugName) {
    try {
        const url = `/netlify/functions/getDpsShortage?name=${encodeURIComponent(drugName)}`;
        const response = await fetch(url);
        const { status } = await response.json();

        if (status === "active") {
            return "⚠️ Shortage reported";
        }

        return null; // Only show message if active shortage confirmed
    } catch (err) {
        console.error("Shortage fetch failed:", err);
        return null;
    }
}
