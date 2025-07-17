export async function getDailyMedDetails(rxCui) {
    try {
        const baseUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?rxnorm=${rxCui}`;
        const listUrl = `/.netlify/functions/proxy?url=${encodeURIComponent(baseUrl)}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        const setId = listData.data?.spls?.[0]?.setid;
        if (!setId) throw new Error("No SPL Set ID found");

        const structuredUrl = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}/structured.json`;
        const structuredProxy = `/.netlify/functions/proxy?url=${encodeURIComponent(structuredUrl)}`;
        const structuredResp = await fetch(structuredProxy);
        const structuredData = await structuredResp.json();

        return {
            Indications: structuredData?.indications_and_usage || "Not available",
            Dosage: structuredData?.dosage_and_administration || "Not available",
            Warnings: structuredData?.warnings_and_cautions || "Not available",
            Storage: structuredData?.how_supplied || "Not available",
            Preparations: structuredData?.dosage_forms_and_strengths || "Not available",
        };
    } catch (err) {
        console.error(`Failed to fetch DailyMed details for RxCUI ${rxCui}:`, err);
        return {
            Indications: "Error loading",
            Dosage: "Error loading",
            Warnings: "Error loading",
            Storage: "Error loading",
            Preparations: "Error loading"
        };
    }
}
